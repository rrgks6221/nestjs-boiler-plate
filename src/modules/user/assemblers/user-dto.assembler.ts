import { User } from '@module/user/domain/user.entity';
import { UserDto } from '@module/user/dto/user.dto';

export class UserDtoAssembler {
  static convertToDto(user: User): UserDto {
    const dto = new UserDto({
      id: user.id,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });

    dto.signInType = user.signInType;

    return dto;
  }
}
