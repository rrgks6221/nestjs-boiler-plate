import { ApiProperty } from '@nestjs/swagger';

export class BaseViewResponseDto {
  constructor(props: BaseViewResponseDto) {
    this.id = props.id;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  @ApiProperty()
  id: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class CommonIdDto {
  constructor(dto: CommonIdDto) {
    this.id = dto.id;
  }

  @ApiProperty()
  id: string;
}

export abstract class OffsetPageRequestDto {
  abstract page: number;
  abstract perPage: number;

  get offset(): number {
    return (this.page - 1) * this.perPage;
  }
}

export abstract class BaseOffsetPaginationResponseDto<T> {
  abstract data: T[];

  @ApiProperty()
  currentPage: number;

  @ApiProperty()
  perPage: number;

  @ApiProperty()
  totalCount: number;

  @ApiProperty()
  totalPages: number;
}
