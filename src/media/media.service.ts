import { Readable } from 'node:stream';
import { CloudinaryResponse } from './media.interface';
import { CreateMediaDto } from './dto/create-media.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction, EntityType } from '../constants/enums';
import { paginate } from '../common/pagination/paginate.util';
import { BadRequestException, Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { PaginationQueryDto } from '../common/pagination/dto/pagination-query.dto';

@Injectable()
export class MediaService {
  constructor(private prismaService: PrismaService) {}

  async create(
    file: Express.Multer.File,
    createMediaDto: CreateMediaDto,
    userId?: string,
  ) {
    const uploadOptions: Record<string, string | undefined> = {
      folder: process.env.CLOUDINARY_FOLDER || 'test_uploads',
    };

    const uploadResult: CloudinaryResponse =
      await new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) reject(new Error(error.message));
            if (!result)
              reject(
                new BadRequestException('No result returned from Cloudinary'),
              );
            else resolve(result);
          },
        );
        Readable.from(file.buffer).pipe(stream);
      });

    return this.prismaService.$transaction(async (tx) => {
      const mediaRecord = await tx.mediaLibrary.create({
        data: {
          fileType: createMediaDto.file_type,
          fileName: createMediaDto.file_name || file.originalname,
          fileAlt: createMediaDto.file_alt || '',
          fileSize: Number(Math.round((file.size / 1024) * 100) / 100),
          fileUrl: uploadResult.secure_url,
          createdById: userId,
          publicId: uploadResult.public_id,
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
      };
    });
  }

  findAll(query: PaginationQueryDto) {
    return paginate(this.prismaService.mediaLibrary, query, {
      orderBy: { createdAt: 'desc' },
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
