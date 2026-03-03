import { applyDecorators } from '@nestjs/common';

import { Transform } from 'class-transformer';

export const ParseOrder = () => {
  return applyDecorators(
    Transform(({ value }: { value: string[] }) =>
      value.map((item) => {
        const [field, direction] = item.split(':');
        return { field, direction };
      }),
    ),
    Transform(({ value }: { value: unknown }) => {
      if (value === undefined || value === null || value === '') {
        return;
      }

      if (Array.isArray(value)) {
        return value.filter((item): item is string => typeof item === 'string');
      }

      if (typeof value === 'string') {
        return [value];
      }

      return;
    }),
  );
};
