import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '@src/apis/auth/controllers/auth.controller';
import { SignInDtoRequestBody } from '@src/apis/auth/dtos/sign-in-request-body.dto';
import { AuthService } from '@src/apis/auth/services/auth.service';
import { UserResponseDto } from '@src/apis/users/dto/user-response.dto';
import { UserEntity } from '@src/apis/users/entities/user.entity';
import { MockAuthService } from '@test/mock/services.mock';

describe(AuthController.name, () => {
  let controller: AuthController;
  let mockAuthService: MockAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useClass: MockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    mockAuthService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe(AuthController.prototype.signIn.name, () => {
    let user: UserEntity;
    let signInDtoRequestBody: SignInDtoRequestBody;
    let mockResponse: any;

    beforeEach(() => {
      user = new UserEntity({ id: 1 });
      signInDtoRequestBody = new SignInDtoRequestBody();
      mockResponse = {};
    });

    it('회원가입 성공', async () => {
      mockAuthService.signIn.mockResolvedValue(user);
      mockAuthService.generateAccessToken.mockResolvedValue(
        faker.datatype.string(),
      );
      mockAuthService.generateRefreshToken.mockResolvedValue(
        faker.datatype.string(),
      );
      mockAuthService.setAuthToken.mockResolvedValue(undefined);

      await expect(
        controller.signIn(mockResponse, signInDtoRequestBody),
      ).resolves.toBeInstanceOf(UserResponseDto);
    });
  });

  describe(AuthController.prototype.signOut.name, () => {
    let mockResponse: any;
    let user: UserEntity;

    beforeEach(() => {
      mockResponse = {};
      user = new UserEntity();
    });

    it('로그아웃', async () => {
      mockAuthService.clearAuthToken.mockResolvedValue(undefined);

      await expect(
        controller.signOut(mockResponse, user),
      ).resolves.toBeUndefined();
    });
  });

  describe(AuthController.prototype.refresh.name, () => {
    let mockRes: any;
    let user: UserEntity;

    beforeEach(() => {
      mockRes = {};
      user = new UserEntity();
    });

    it('리프래시', async () => {
      mockAuthService.generateAccessToken.mockResolvedValue(
        faker.datatype.string(),
      );
      mockAuthService.generateRefreshToken.mockResolvedValue(
        faker.datatype.string(),
      );
      mockAuthService.setAuthToken.mockResolvedValue(undefined);

      await expect(controller.refresh(mockRes, user)).resolves.toBeUndefined();
    });
  });
});
