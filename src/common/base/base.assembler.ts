export interface IBaseAssembler<Entity, Dto> {
  convertToDto(entity: Entity): Dto;
}
