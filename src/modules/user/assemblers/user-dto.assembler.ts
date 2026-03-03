import { UserDto } from '@module/user/dto/user.dto';
import { UserModel } from '@module/user/repositories/user.read-repository.interface';

export class UserDtoAssembler {
  static convertToDto(user: UserModel): UserDto {
    const dto = new UserDto({
      id: user.id,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });

    dto.username = user.username;
    dto.signInType = user.signInType;

    return dto;
  }
}
