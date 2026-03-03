import { UserPageItemDto } from '@module/user/dto/user-item.dto';
import { ListUsersOffsetPageDto } from '@module/user/dto/user-offset-page.dto';
import {
  UserModel,
  UserPageItemModel,
} from '@module/user/repositories/user.read-repository.interface';

import { OffsetPage } from '@common/base/base.model';

export class UserCollectionDtoAssembler {
  static convertToOffsetPageDto(
    page: OffsetPage<UserModel>,
  ): ListUsersOffsetPageDto {
    const dto = new ListUsersOffsetPageDto();

    dto.data = page.data.map((user) => this.convertToItemDto(user));
    dto.currentPage = page.currentPage;
    dto.perPage = page.perPage;
    dto.totalCount = page.totalCount;
    dto.totalPages = page.totalPages;

    return dto;
  }

  private static convertToItemDto(user: UserPageItemModel): UserPageItemDto {
    const dto = new UserPageItemDto({
      id: user.id,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });

    dto.username = user.username;
    dto.signInType = user.signInType;

    return dto;
  }
}
