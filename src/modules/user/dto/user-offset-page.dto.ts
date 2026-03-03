import { ApiProperty } from '@nestjs/swagger';

import { UserPageItemDto } from '@module/user/dto/user-item.dto';

import { BaseOffsetPaginationResponseDto } from '@common/base/base.dto';

export class ListUsersOffsetPageDto extends BaseOffsetPaginationResponseDto<UserPageItemDto> {
  @ApiProperty({ type: [UserPageItemDto] })
  data: UserPageItemDto[];
}
