import { ValidateIf, ValidationOptions } from 'class-validator';

export function IsNullable(options?: ValidationOptions): PropertyDecorator {
  return function IsNullableDecorator(
    prototype: object,
    propertyKey: string | symbol,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    ValidateIf((obj) => obj[propertyKey] !== null, options)(
      prototype,
      propertyKey,
    );
  };
}
