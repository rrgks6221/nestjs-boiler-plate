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
