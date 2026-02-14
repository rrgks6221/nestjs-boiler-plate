import { ApiProperty } from '@nestjs/swagger';

import { SignInType } from '@module/user/domain/user.entity';

import { BaseResponseDto } from '@common/base/base.dto';

export class UserDto extends BaseResponseDto {
  @ApiProperty({
    type: 'string',
    enum: SignInType,
  })
  signInType: SignInType;
}
