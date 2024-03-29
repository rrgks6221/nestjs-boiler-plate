import { Test, TestingModule } from '@nestjs/testing';
import { PostCommentsService } from '../services/post-comments.service';
import { PostCommentsController } from './post-comments.controller';

describe('PostCommentsController', () => {
  let controller: PostCommentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostCommentsController],
      providers: [PostCommentsService],
    }).compile();

    controller = module.get<PostCommentsController>(PostCommentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
