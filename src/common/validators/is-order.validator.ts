import {
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';

export function IsOrder(
  allowFields: Readonly<string[]>,
  validationOptions?: ValidationOptions,
) {
  return function (obj: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      name: 'IsOrder',
      target: obj.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: Record<string, string>[]) {
          console.log(value);
          return value.every(({ field, direction }) => {
            return (
              allowFields.includes(field) && ['asc', 'desc'].includes(direction)
            );
          });
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be an array of objects with allowed fields and directions (asc, desc)`;
        },
      },
    });
  };
}
