import { applyDecorators } from '@nestjs/common';
import { SortOrder } from '@src/constants/enum';
import { ERROR_CODE } from '@src/constants/error-response-code.constant';
import { HttpInternalServerErrorException } from '@src/http-exceptions/exceptions/http-internal-server-error.exception';
import { Transform } from 'class-transformer';

export type OrderBy<T extends readonly string[]> = Partial<
  Record<T[number], SortOrder>
>;

export const CsvToOrderBy = <T extends readonly string[] = readonly string[]>(
  fields: T[number][],
  defaultOrderBy: Record<T[number], SortOrder>[] = [
    {
      id: SortOrder.Desc,
    } as Record<T[number], SortOrder>,
  ],
): PropertyDecorator => {
  return applyDecorators(
    Transform(({ value }: { value: unknown }): OrderBy<T>[] => {
      const getField = (field: string): T[number] => {
        return field.startsWith('-') ? field.slice(1) : field;
      };

      const getSortOrder = (field: string): SortOrder => {
        const startsWithDash = field.startsWith('-');

        return startsWithDash ? SortOrder.Asc : SortOrder.Desc;
      };

      // queryString 에 들어가는 transformer 인데 string 형태가 아닌 경우는 서버에러로 판단한다.
      if (typeof value !== 'string') {
        throw new HttpInternalServerErrorException({
          errorCode: ERROR_CODE.CODE001,
          log: 'CsvToOrderBy 중 value 가 string type 이 아님',
        });
      }

      const requestOrders = value.split(',');

      if (requestOrders.length === 0) {
        return defaultOrderBy;
      }

      const allowFields = requestOrders.filter((requestOrder) => {
        const field = getField(requestOrder);

        return fields.includes(field);
      });

      if (allowFields.length === 0) {
        return defaultOrderBy;
      }

      return allowFields.map((allowField) => {
        const field = getField(allowField);
        const sortOrder = getSortOrder(allowField);

        return {
          [field]: sortOrder,
        };
      }) as Record<T[number], SortOrder>[];
    }),
  );
};
