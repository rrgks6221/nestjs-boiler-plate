import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto {
  constructor(props: BaseResponseDto) {
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
