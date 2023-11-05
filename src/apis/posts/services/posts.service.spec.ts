import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { CreatePostRequestBodyDto } from '@src/apis/posts/dto/create-post-request-body.dto';
import { FindPostListQueryDto } from '@src/apis/posts/dto/find-post-list-query-dto';
import { PatchUpdatePostBodyDto } from '@src/apis/posts/dto/patch-update-post-body.dto';
import { PutUpdatePostBodyDto } from '@src/apis/posts/dto/put-update-post-body-dto';
import { PostEntity } from '@src/apis/posts/entities/post.entity';
import { PostsService } from '@src/apis/posts/services/posts.service';
import { SortOrder } from '@src/constants/enum';
import { PrismaService } from '@src/core/prisma/prisma.service';
import { QueryHelper } from '@src/helpers/query.helper';
import { HttpForbiddenException } from '@src/http-exceptions/exceptions/http-forbidden.exception';
import { HttpNotFoundException } from '@src/http-exceptions/exceptions/http-not-found.exception';
import { MockQueryHelper } from '@test/mock/helper.mock';
import { mockPrismaService } from '@test/mock/prisma-service.mock';

describe(PostsService.name, () => {
  let service: PostsService;
  let mockQueryHelper: MockQueryHelper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: QueryHelper,
          useClass: MockQueryHelper,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    mockQueryHelper = module.get(QueryHelper);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe(PostsService.prototype.findAllAndCount.name, () => {
    let findPostListQueryDto: FindPostListQueryDto;

    let posts: PostEntity[];
    let count: number;

    beforeEach(() => {
      findPostListQueryDto = {
        title: 'title',
        page: 1,
        pageSize: 20,
        orderBy: {
          id: SortOrder.Desc,
        },
      };

      posts = [new PostEntity()];
      count = 1;
    });

    it('find post all and count', async () => {
      mockQueryHelper.buildWherePropForFind.mockReturnValue({
        title: 'title',
      });

      mockPrismaService.$transaction.mockResolvedValue([posts, count]);

      await expect(
        service.findAllAndCount(findPostListQueryDto),
      ).resolves.toStrictEqual([posts, count]);
      expect(mockQueryHelper.buildWherePropForFind).toBeCalledWith(
        { title: 'title' },
        expect.anything(),
      );
      expect(mockPrismaService.post.findMany).toBeCalledWith({
        where: expect.anything(),
        orderBy: expect.anything(),
        skip: 20,
        take: 20,
      });
      expect(mockPrismaService.post.count).toBeCalledWith({
        where: expect.anything(),
      });
    });
  });

  describe(PostsService.prototype.findOneOrNotFound.name, () => {
    let postId: number;
    let existPost: PostEntity;

    let postEntity: PostEntity;

    beforeEach(() => {
      postId = faker.datatype.number({ min: 1 });
      existPost = new PostEntity();
    });

    it('post is not found', async () => {
      mockPrismaService.post.findFirst.mockResolvedValue(null);

      await expect(service.findOneOrNotFound(postId)).rejects.toThrowError(
        HttpNotFoundException,
      );
    });

    it('find one post', async () => {
      mockPrismaService.post.findFirst.mockResolvedValue(existPost);

      await expect(service.findOneOrNotFound(postId)).resolves.toStrictEqual(
        existPost,
      );
    });
  });

  describe(PostsService.prototype.create.name, () => {
    let userId: number;
    let createPostBodyDto: CreatePostRequestBodyDto;

    let newPost: PostEntity;

    beforeEach(() => {
      userId = faker.datatype.number({ min: 1 });
      createPostBodyDto = new CreatePostRequestBodyDto();

      newPost = new PostEntity();
    });

    it('create new post', async () => {
      mockPrismaService.post.create.mockResolvedValue(newPost);

      await expect(
        service.create(userId, createPostBodyDto),
      ).resolves.toStrictEqual(newPost);
    });
  });

  describe(PostsService.prototype.putUpdate.name, () => {
    let postId: number;
    let userId: number;
    let putUpdatePostDto: PutUpdatePostBodyDto;

    let newPost: PostEntity;

    let existPost: PostEntity;

    beforeEach(() => {
      postId = faker.datatype.number({ min: 1 });
      userId = faker.datatype.number({ min: 1 });
      putUpdatePostDto = new PutUpdatePostBodyDto();

      newPost = new PostEntity({
        userId,
        id: postId,
      });

      existPost = new PostEntity({
        userId,
        id: postId,
      });

      mockPrismaService.post.findFirst.mockResolvedValue(existPost);
    });

    it('put update post', async () => {
      mockPrismaService.post.update.mockResolvedValue(newPost);

      await expect(
        service.putUpdate(postId, userId, putUpdatePostDto),
      ).resolves.toStrictEqual(newPost);
    });
  });

  describe(PostsService.prototype.patchUpdate.name, () => {
    let postId: number;
    let userId: number;
    let patchUpdatePostDto: PatchUpdatePostBodyDto;

    let newPost: PostEntity;

    let existPost: PostEntity;

    beforeEach(() => {
      postId = faker.datatype.number({ min: 1 });
      userId = faker.datatype.number({ min: 1 });
      patchUpdatePostDto = new PatchUpdatePostBodyDto();

      existPost = new PostEntity({
        userId,
        id: postId,
      });

      newPost = new PostEntity({
        userId,
        id: postId,
      });

      mockPrismaService.post.findFirst.mockResolvedValue(existPost);
    });

    it('patch update post', async () => {
      mockPrismaService.post.update.mockResolvedValue(newPost);

      await expect(
        service.patchUpdate(postId, userId, patchUpdatePostDto),
      ).resolves.toStrictEqual(newPost);
    });
  });

  describe(PostsService.prototype.remove.name, () => {
    let postId: number;
    let userId: number;

    let existPost: PostEntity;

    let deletedPost: PostEntity;

    beforeEach(() => {
      postId = faker.datatype.number({ min: 1 });
      userId = faker.datatype.number({ min: 1 });

      existPost = new PostEntity({
        userId,
        id: postId,
      });

      deletedPost = new PostEntity({
        deletedAt: new Date(),
      });

      mockPrismaService.post.findFirst.mockResolvedValue(existPost);
    });

    it('soft delete post', async () => {
      mockPrismaService.post.update.mockResolvedValue(deletedPost);

      await expect(service.remove(postId, userId)).resolves.toBe(1);
    });
  });

  describe(PostsService.prototype.buildDetailResponse.name, () => {
    let postId: number;

    let postEntity: PostEntity;

    beforeEach(() => {
      postId = faker.datatype.number({ min: 1 });

      postEntity = new PostEntity();

      mockPrismaService.post.findFirstOrThrow.mockResolvedValueOnce(postEntity);
    });

    it('return post', async () => {
      mockPrismaService.post.findFirstOrThrow.mockResolvedValue(postEntity);

      await expect(service.buildDetailResponse(postId)).resolves.toEqual(
        postEntity,
      );
    });
  });

  describe(PostsService.prototype.increaseHit.name, () => {
    let postId: number;

    beforeEach(() => {
      postId = NaN;
    });

    it('when not exist post throw not found error', async () => {
      postId = faker.datatype.number();

      mockPrismaService.post.updateMany.mockResolvedValue({
        count: 0,
      });

      await expect(service.increaseHit(postId)).rejects.toThrowError(
        HttpNotFoundException,
      );
    });

    it('post hit increase 1', async () => {
      postId = faker.datatype.number();

      mockPrismaService.post.updateMany.mockResolvedValue({
        count: 1,
      });

      await expect(service.increaseHit(postId)).resolves.toBeUndefined();
      expect(mockPrismaService.post.updateMany).toBeCalledWith(
        expect.objectContaining({
          data: {
            hit: {
              increment: 1,
            },
          },
        }),
      );
    });
  });

  describe('private method test with public method', () => {
    describe('checkOwner with remove', () => {
      let postId: number;
      let userId: number;

      let existPost: PostEntity;

      let removedPost: PostEntity;

      beforeEach(() => {
        postId = faker.datatype.number({ min: 1 });
        userId = faker.datatype.number({ min: 1 });

        removedPost = new PostEntity();

        mockPrismaService.post.update.mockResolvedValue(removedPost);
      });

      it('not found post', async () => {
        mockPrismaService.post.findFirst.mockResolvedValue(existPost);

        await expect(service.remove(postId, userId)).rejects.toThrowError(
          HttpNotFoundException,
        );
      });

      it('not owner post', async () => {
        existPost = new PostEntity({
          id: postId,
          userId: userId + 1,
        });

        mockPrismaService.post.findFirst.mockResolvedValue(existPost);

        await expect(service.remove(postId, userId)).rejects.toThrowError(
          HttpForbiddenException,
        );
      });

      it('owner post', async () => {
        existPost = new PostEntity({
          userId,
          id: postId,
        });

        mockPrismaService.post.findFirst.mockResolvedValue(existPost);

        await expect(service.remove(postId, userId)).resolves.toBe(1);
      });
    });
  });
});
