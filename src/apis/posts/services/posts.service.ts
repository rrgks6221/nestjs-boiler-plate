import { Injectable } from '@nestjs/common';
import { Post } from '@prisma/client';
import { CreatePostRequestBodyDto } from '@src/apis/posts/dto/create-post-request-body.dto';
import { FindPostListQueryDto } from '@src/apis/posts/dto/find-post-list-query-dto';
import { PatchUpdatePostBodyDto } from '@src/apis/posts/dto/patch-update-post-body.dto';
import { PutUpdatePostBodyDto } from '@src/apis/posts/dto/put-update-post-body-dto';
import { PostEntity } from '@src/apis/posts/entities/post.entity';
import { ERROR_CODE } from '@src/constants/error-response-code.constant';
import { PrismaService } from '@src/core/prisma/prisma.service';
import { QueryHelper } from '@src/helpers/query.helper';
import { HttpForbiddenException } from '@src/http-exceptions/exceptions/http-forbidden.exception';
import { HttpNotFoundException } from '@src/http-exceptions/exceptions/http-not-found.exception';
import { RestService } from '@src/types/type';

@Injectable()
export class PostsService implements RestService<PostEntity> {
  private readonly LIKE_SEARCH_FIELDS: (keyof Partial<PostEntity>)[] = [
    'title',
    'description',
  ];

  constructor(
    private readonly prismaService: PrismaService,
    private readonly queryHelper: QueryHelper,
  ) {}

  async findAllAndCount(
    findPostListQueryDto: FindPostListQueryDto,
  ): Promise<[PostEntity[], number]> {
    const { page, pageSize, orderBy, ...filter } = findPostListQueryDto;

    const where = this.queryHelper.buildWherePropForFind<Post>(
      filter,
      this.LIKE_SEARCH_FIELDS,
    );

    const postsQuery = this.prismaService.post.findMany({
      where: {
        ...where,
        deletedAt: null,
      },
      orderBy,
      skip: page * pageSize,
      take: pageSize,
    });

    const totalCountQuery = this.prismaService.post.count({
      where: {
        ...where,
        deletedAt: null,
      },
    });

    const [posts, count] = await this.prismaService.$transaction([
      postsQuery,
      totalCountQuery,
    ]);

    return [posts, count];
  }

  async findOneOrNotFound(postId: number): Promise<PostEntity> {
    const existPost = await this.prismaService.post.findFirst({
      where: {
        id: postId,
        deletedAt: null,
      },
    });

    if (!existPost) {
      throw new HttpNotFoundException({
        errorCode: ERROR_CODE.CODE005,
        message: `postId ${postId} doesn't exist`,
      });
    }

    return existPost;
  }

  create(
    userId: number,
    createPostBodyDto: CreatePostRequestBodyDto,
  ): Promise<PostEntity> {
    return this.prismaService.post.create({
      data: {
        title: createPostBodyDto.title,
        description: createPostBodyDto.description,
        userId: userId,
      },
    });
  }

  async putUpdate(
    postId: number,
    userId: number,
    putUpdatePostDto: PutUpdatePostBodyDto,
  ): Promise<PostEntity> {
    await this.checkOwner(postId, userId);

    return this.prismaService.post.update({
      where: {
        id: postId,
      },
      data: {
        title: putUpdatePostDto.title,
        description: putUpdatePostDto.description,
      },
    });
  }

  async patchUpdate(
    postId: number,
    userId: number,
    patchUpdatePostDto: PatchUpdatePostBodyDto,
  ): Promise<PostEntity> {
    await this.checkOwner(postId, userId);

    return this.prismaService.post.update({
      where: {
        id: postId,
      },
      data: patchUpdatePostDto,
    });
  }

  async remove(postId: number, userId: number): Promise<number> {
    await this.checkOwner(postId, userId);

    const removedPost = await this.prismaService.post.update({
      data: {
        deletedAt: new Date(),
      },
      where: {
        id: postId,
      },
    });

    return Number(!!removedPost);
  }

  async increaseHit(postId: number): Promise<void> {
    const batchPayload = await this.prismaService.post.updateMany({
      data: {
        hit: {
          increment: 1,
        },
      },
      where: {
        id: postId,
      },
    });

    if (batchPayload.count === 0) {
      throw new HttpNotFoundException({
        errorCode: ERROR_CODE.CODE005,
        message: `postId ${postId} doesn't exist`,
      });
    }
  }

  buildDetailResponse(postId: number): Promise<PostEntity> {
    return this.prismaService.post.findFirstOrThrow({
      where: {
        id: postId,
        deletedAt: null,
      },
    });
  }

  private async checkOwner(postId: number, userId: number) {
    const existPost = await this.prismaService.post.findFirst({
      select: {
        id: true,
        userId: true,
      },
      where: {
        id: postId,
        deletedAt: null,
      },
    });

    if (!existPost) {
      throw new HttpNotFoundException({
        errorCode: ERROR_CODE.CODE005,
        message: `postId ${postId} doesn't exist`,
      });
    }

    if (existPost.userId !== userId) {
      throw new HttpForbiddenException({
        errorCode: ERROR_CODE.CODE006,
        message: `post ${postId} is not owned by user ${userId}`,
      });
    }

    return existPost;
  }
}
