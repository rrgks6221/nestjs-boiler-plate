import {
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';

export function IsPositiveIntString(validationOptions?: ValidationOptions) {
  return function (obj: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      name: 'IsPositiveIntString',
      target: obj.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return typeof value === 'string' && /^[1-9]\d*$/.test(value);
        },

        defaultMessage: (validationArguments: ValidationArguments): string => {
          const { property } = validationArguments;

          return `${property} must be a positive integer string`;
        },
      },
    });
  };
}
