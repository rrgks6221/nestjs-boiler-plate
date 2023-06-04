import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '@src/apis/users/services/users.service';
import { UsersController } from '@src/apis/users/controllers/users.controller';
import { MockUserService } from '@test/mock/servies.mock';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useClass: MockUserService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});