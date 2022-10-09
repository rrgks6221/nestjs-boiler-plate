import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreatePostDto } from '../dto/create-post.dto';
import { PrismaService } from '@src/modules/core/database/prisma/prisma.service';
import { Post } from '@prisma/client';
import { PostEntity } from '@src/modules/post/entities/post.entity';
import { PatchUpdatePostDto } from '@src/modules/post/dto/patch-update-post.dto';
import { PostAuthorityHelper } from '@src/modules/post/helpers/post-authority.helper';

@Injectable()
export class PostService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly postAuthorityHelper: PostAuthorityHelper,
  ) {}

  create(userId: number, createPostDto: CreatePostDto): Promise<Post> {
    return this.prismaService.post.create({
      data: {
        title: createPostDto.title,
        description: createPostDto.description,
        authorId: userId,
      },
    });
  }

  findAll() {
    return `This action returns all post`;
  }

  findOne(id: number): Promise<PostEntity> {
    return this.prismaService.post.findUnique({
      where: {
        id,
      },
    });
  }

  async patchUpdate(
    id: number,
    authorId: number,
    patchUpdatePostDto: PatchUpdatePostDto,
  ): Promise<PostEntity> {
    const postByUser: PostEntity =
      await this.postAuthorityHelper.checkIdentification(id, authorId);

    if (!postByUser) {
      throw new ForbiddenException();
    }

    return this.prismaService.post.update({
      where: {
        id,
      },
      data: {
        published: patchUpdatePostDto.published,
      },
    });
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}