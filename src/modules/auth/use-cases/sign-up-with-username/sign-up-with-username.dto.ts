import { ApiProperty } from '@nestjs/swagger';

import { IsString, MaxLength } from 'class-validator';

/**
 * @todo 적절한 password 암호 규칙을 지정하세요
 */
export class SignUpWithUsernameDto {
  @ApiProperty()
  @MaxLength(20)
  @IsString()
  username: string;

  @ApiProperty()
  @IsString()
  password: string;
}
