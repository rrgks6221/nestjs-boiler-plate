import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

import { OffsetPageRequestDto } from '@common/base/base.dto';
import { ISort } from '@common/base/base.read-repository';
import { ParseOrder } from '@common/decorators/parse-order.decorator';
import { IsOrder } from '@common/validators/is-order.validator';

const ORDER_FIELDS = ['id', 'createdAt'] as const;
type OrderField = (typeof ORDER_FIELDS)[number];

export class ListUsersRequestQueryDto extends OffsetPageRequestDto {
  @ApiProperty({
    required: false,
    minimum: 1,
  })
  @Min(1)
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  page: number = 1;

  @ApiProperty({
    required: false,
    minimum: 5,
    maximum: 1000,
    default: 20,
  })
  @Max(1000)
  @Min(5)
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  perPage: number = 20;

  @ApiPropertyOptional({})
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    description: `허용되는 필드는 ${ORDER_FIELDS.join(',')} 입니다. 형식은 field:direction (예: createdAt:asc)`,
    type: [String],
    default: ['createdAt:asc'],
    example: ['id:asc', 'createdAt:desc'],
  })
  @IsOrder(ORDER_FIELDS)
  @IsArray()
  @ParseOrder()
  @IsOptional()
  order?: ISort<OrderField>[];
}
