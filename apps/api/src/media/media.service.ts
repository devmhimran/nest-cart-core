import { Readable } from 'node:stream';
import { CloudinaryResponse } from './media.interface';
import { CreateMediaDto } from './dto/create-media.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction, EntityType } from '../constants/enums';
import { paginate } from '../common/pagination/paginate.util';
import { BadRequestException, Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { PaginationQueryDto } from '../common/pagination/dto/pagination-query.dto';
import { basename, extname } from 'path';
import { Prisma } from '../../generated/prisma/client';

@Injectable()
export class MediaService {
  constructor(private prismaService: PrismaService) {}

  async create(
    file: Express.Multer.File,
    createMediaDto: CreateMediaDto,
    userId?: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const extension = extname(file.originalname).replace('.', '').toLowerCase();

    const allowedTypes = [
      'webp',
      'png',
      'jpg',
      'jpeg',
      'svg',
      'pdf',
      'csv',
      'xlsx',
    ];

    if (!allowedTypes.includes(extension)) {
      throw new BadRequestException(
        `Unsupported file type. Allowed types: ${allowedTypes.join(', ')}`,
      );
    }

    const uploadOptions: Record<string, string | undefined> = {
      folder: process.env.CLOUDINARY_FOLDER || 'test_uploads',
    };

    const uploadResult: CloudinaryResponse =
      await new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              return reject(new BadRequestException(error.message));
            }

            if (!result) {
              return reject(
                new BadRequestException('No result returned from Cloudinary'),
              );
            }

            resolve(result);
          },
        );

        Readable.from(file.buffer).pipe(stream);
      });

    const fileName = basename(file.originalname, extname(file.originalname));
    const title = createMediaDto.title || fileName;
    const fileSize = Math.round((file.size / 1024) * 100) / 100;

    return this.prismaService.$transaction(async (tx) => {
      const mediaRecord = await tx.mediaLibrary.create({
        data: {
          title,
          fileType: extension,
          fileName,
          fileAlt: createMediaDto.file_alt ?? '',
          fileSize,
          fileUrl: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          createdById: userId,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: AuditAction.CREATE,
          entity: EntityType.MEDIA,
          entityId: mediaRecord.id,
          newData: JSON.stringify(mediaRecord),
        },
      });

      return {
        message: 'File uploaded successfully',
        data: mediaRecord,
      };
    });
  }

  findAll(query: PaginationQueryDto) {
    const { search } = query;

    const where: Prisma.MediaLibraryWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { fileName: { contains: search, mode: 'insensitive' } },
        { fileAlt: { contains: search, mode: 'insensitive' } },
      ];
    }

    return paginate(this.prismaService.mediaLibrary, query, {
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        fileName: true,
        fileAlt: true,
        fileType: true,
        fileSize: true,
        fileUrl: true,
        createdAt: true,
      },
    });
  }

  findOne(id: number) {
    return this.prismaService.mediaLibrary.findUnique({
      where: { id },
      select: {
        id: true,
        fileName: true,
        fileAlt: true,
        fileType: true,
        fileSize: true,
        fileUrl: true,
        createdAt: true,
      },
    });
  }

  remove(id: number, userId?: string) {
    return this.prismaService.$transaction(async (tx) => {
      const media = await tx.mediaLibrary.findUnique({ where: { id } });
      if (!media) {
        throw new BadRequestException(`Media record not found.`);
      }

      if (media.publicId) {
        await cloudinary.uploader.destroy(media.publicId);
      } else {
        throw new BadRequestException(
          `Cannot delete asset: Public ID missing.`,
        );
      }

      await tx.mediaLibrary.delete({ where: { id } });

      await tx.auditLog.create({
        data: {
          userId,
          action: AuditAction.DELETE,
          entity: EntityType.MEDIA,
          entityId: id,
          oldData: JSON.stringify(media),
        },
      });

      return {
        message: 'Media record deleted successfully',
      };
    });
  }
}
