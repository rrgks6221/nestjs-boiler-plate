import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from '@src/apis/posts/controllers/posts.controller';
import { CreatePostRequestBodyDto } from '@src/apis/posts/dto/create-post-request-body.dto';
import { FindPostListQueryDto } from '@src/apis/posts/dto/find-post-list-query-dto';
import { PatchUpdatePostBodyDto } from '@src/apis/posts/dto/patch-update-post-body.dto';
import { PostResponseDto } from '@src/apis/posts/dto/post-response.dto';
import { PutUpdatePostBodyDto } from '@src/apis/posts/dto/put-update-post-body-dto';
import { PostsService } from '@src/apis/posts/services/posts.service';
import { UserEntity } from '@src/apis/users/entities/user.entity';
import { MockPostsService } from '@test/mock/services.mock';

describe(PostsController.name, () => {
  let controller: PostsController;
  let mockPostsService: MockPostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useClass: MockPostsService,
        },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    mockPostsService = module.get(PostsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe(PostsController.prototype.findAllAndCount.name, () => {
    let query: FindPostListQueryDto;

    let posts: PostResponseDto[];
    let totalCount: number;

    beforeEach(() => {
      query = new FindPostListQueryDto();

      posts = [new PostResponseDto()];
      totalCount = faker.datatype.number();
    });

    it('only routing and service method called', async () => {
      mockPostsService.findAllAndCount.mockResolvedValue([posts, totalCount]);

      await expect(controller.findAllAndCount(query)).resolves.toStrictEqual([
        posts,
        totalCount,
      ]);
      expect(mockPostsService.findAllAndCount).toBeCalledWith(query);
    });
  });

  describe(PostsController.prototype.findOne.name, () => {
    let postId: number;

    let post: PostResponseDto;

    beforeEach(() => {
      postId = faker.datatype.number({ min: 1 });

      post = new PostResponseDto();
    });

    it('only routing and service method called', async () => {
      mockPostsService.findOneOrNotFound.mockResolvedValue(post);

      await expect(controller.findOne(postId)).resolves.toStrictEqual(post);
      expect(mockPostsService.findOneOrNotFound).toBeCalledWith(postId);
    });
  });

  describe(PostsController.prototype.create.name, () => {
    let user: UserEntity;
    let body: CreatePostRequestBodyDto;

    let post: PostResponseDto;

    beforeEach(() => {
      user = new UserEntity();
      body = new CreatePostRequestBodyDto();

      post = new PostResponseDto();
    });

    it('only routing and service method called', async () => {
      mockPostsService.create.mockResolvedValue(post);

      await expect(controller.create(user, body)).resolves.toStrictEqual(post);
      expect(mockPostsService.create).toBeCalledWith(user.id, body);
    });
  });

  describe(PostsController.prototype.putUpdate.name, () => {
    let postId: number;
    let user: UserEntity;
    let putUpdatePostDto: PutUpdatePostBodyDto;

    let post: PostResponseDto;

    beforeEach(() => {
      postId = faker.datatype.number({ min: 1 });
      user = new UserEntity();
      putUpdatePostDto = new PutUpdatePostBodyDto();

      post = new PostResponseDto();
    });

    it('only routing and service method called', async () => {
      mockPostsService.putUpdate.mockResolvedValue(post);

      await expect(
        controller.putUpdate(postId, user, putUpdatePostDto),
      ).resolves.toStrictEqual(post);
      expect(mockPostsService.putUpdate).toBeCalledWith(
        postId,
        user.id,
        putUpdatePostDto,
      );
    });
  });

  describe(PostsController.prototype.patchUpdate.name, () => {
    let postId: number;
    let user: UserEntity;
    let patchUpdatePostDto: PatchUpdatePostBodyDto;

    let post: PostResponseDto;

    beforeEach(() => {
      postId = faker.datatype.number({ min: 1 });
      user = new UserEntity();
      patchUpdatePostDto = new PatchUpdatePostBodyDto();

      post = new PostResponseDto();
    });

    it('only routing and service method called', async () => {
      mockPostsService.patchUpdate.mockResolvedValue(post);

      await expect(
        controller.patchUpdate(postId, user, patchUpdatePostDto),
      ).resolves.toStrictEqual(post);
      expect(mockPostsService.patchUpdate).toBeCalledWith(
        postId,
        user.id,
        patchUpdatePostDto,
      );
    });
  });

  describe(PostsController.prototype.remove.name, () => {
    let postId: number;
    let user: UserEntity;

    let count: number;

    beforeEach(() => {
      postId = faker.datatype.number({ min: 1 });
      user = new UserEntity();

      count = faker.datatype.number();
    });

    it('only routing and service method called', async () => {
      mockPostsService.remove.mockResolvedValue(count);

      await expect(controller.remove(postId, user)).resolves.toStrictEqual(
        count,
      );
      expect(mockPostsService.remove).toBeCalledWith(postId, user.id);
    });
  });

  describe(PostsController.prototype.increaseHit.name, () => {
    let postId: number;

    beforeEach(() => {
      postId = NaN;
    });

    it('only routing and service method called', async () => {
      postId = faker.datatype.number();

      mockPostsService.increaseHit.mockResolvedValue(undefined);

      await expect(controller.increaseHit(postId)).resolves.toBeUndefined();
    });
  });
});
