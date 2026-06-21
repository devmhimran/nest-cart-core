import 'multer';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  MaxFileSizeValidator,
  ParseFilePipe,
  FileTypeValidator,
  Query,
} from '@nestjs/common';
import { UserRole } from '../constants/enums';
import { MediaService } from './media.service';
import type { AuthUser } from '../auth/auth.interface';
import { CreateMediaDto } from './dto/create-media.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthCtx } from '../user/decorators/user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../common/pagination/dto/pagination-query.dto';

@Controller('media')
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  @UseInterceptors(FileInterceptor('media'))
  create(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({
            fileType:
              /(image\/(webp|png|jpeg|jpg|svg\+xml)|application\/pdf|text\/csv|application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet)/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() createMediaDto: CreateMediaDto,
    @AuthCtx() user: AuthUser,
  ) {
    return this.mediaService.create(file, createMediaDto, user.id);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.mediaService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mediaService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @AuthCtx() user: AuthUser) {
    return this.mediaService.remove(+id, user.id);
  }
}
