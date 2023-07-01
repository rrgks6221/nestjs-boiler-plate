import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SignInDto } from '@src/apis/auth/dtos/sign-in.dto';
import { JwtAuthGuard } from '@src/apis/auth/guards/jwt-auth.guard';
import { RefreshAuthGuard } from '@src/apis/auth/guards/refresh-auth-guard.guard';
import { AuthService } from '@src/apis/auth/services/auth.service';
import { CreateUserRequestBodyDto } from '@src/apis/users/dto/create-user-request-body.dto';
import { UserEntity } from '@src/apis/users/entities/user.entity';
import { User } from '@src/decorators/user.decorator';
import { ParsePositiveIntPipe } from '@src/pipes/parse-positive-int.pipe';
import { Response } from 'express';

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '로그인한 유저 프로필 조회' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  getProfile(@User() user: UserEntity) {
    return new UserEntity(user);
  }

  @Post('sign-up')
  async signUp(
    @Res({ passthrough: true }) res: Response,
    @Body() createUserRequestBodyDto: CreateUserRequestBodyDto,
  ): Promise<UserEntity> {
    const user = await this.authService.signUp(createUserRequestBodyDto);
    const accessToken = await this.authService.generateAccessToken(user.id);
    const refreshToken = await this.authService.generateRefreshToken(user.id);

    res.cookie('access_token', accessToken);
    res.cookie('refresh_token', refreshToken);

    await this.authService.setAuthToken(res, user.id, {
      accessToken,
      refreshToken,
    });

    return user;
  }

  @Post('sign-in')
  async signIn(
    @Res({ passthrough: true }) res: Response,
    @Body() signInDto: SignInDto,
  ): Promise<UserEntity> {
    const user = await this.authService.signIn(signInDto);
    const accessToken = await this.authService.generateAccessToken(user.id);
    const refreshToken = await this.authService.generateRefreshToken(user.id);

    await this.authService.setAuthToken(res, user.id, {
      accessToken,
      refreshToken,
    });

    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('sign-out')
  @HttpCode(204)
  async signOut(
    @Res({ passthrough: true }) res: Response,
    @User() user: UserEntity,
  ): Promise<void> {
    await this.authService.clearAuthToken(res, user.id);
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  async refresh(
    @User() user: UserEntity,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserEntity> {
    const accessToken = await this.authService.generateAccessToken(user.id);
    const refreshToken = await this.authService.generateRefreshToken(user.id);

    await this.authService.setAuthToken(res, user.id, {
      accessToken,
      refreshToken,
    });

    return user;
  }

  @ApiOperation({ summary: '개발용으로 생성된 엑세스 토큰 생성 api' })
  @Post('access-token/:userId')
  createAccessTokenForDevelop(
    @Param('userId', ParsePositiveIntPipe) userId: number,
  ): string {
    return this.authService.createAccessToken(userId);
  }
}
