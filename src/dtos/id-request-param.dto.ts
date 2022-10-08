import { ApiProperty } from '@nestjs/swagger';
import { Min } from 'class-validator';
import { Type } from 'class-transformer';

export class IdRequestParamDto {
  @ApiProperty({
    description: '고유 ID',
    type: 'number',
    required: true,
  })
  @Min(1)
  @Type(() => Number)
  id: number;
}
