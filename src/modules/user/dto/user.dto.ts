import { ApiProperty } from '@nestjs/swagger';

import { SignInType } from '@module/user/domain/user.entity';

import { BaseResponseDto } from '@common/base/base.dto';

export class UserDto extends BaseResponseDto {
  @ApiProperty()
  signInType: SignInType;
}
