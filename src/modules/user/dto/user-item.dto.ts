import { ApiProperty } from '@nestjs/swagger';

import { SignInType } from 'generated/prisma/enums';

import { BaseViewResponseDto } from '@common/base/base.dto';

export class UserPageItemDto extends BaseViewResponseDto {
  @ApiProperty()
  username: string;

  @ApiProperty({
    enum: SignInType,
  })
  signInType: SignInType;
}
