import { ApiProperty } from '@nestjs/swagger';

import { SignInType } from '@module/user/domain/user.entity';

import { BaseViewResponseDto } from '@common/base/base.dto';

export class UserDto extends BaseViewResponseDto {
  @ApiProperty({
    enum: SignInType,
  })
  signInType: SignInType;
}
