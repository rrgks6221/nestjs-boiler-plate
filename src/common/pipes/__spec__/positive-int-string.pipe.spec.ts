import { ArgumentMetadata } from '@nestjs/common';

import { faker } from '@faker-js/faker';

import { BaseHttpException } from '@common/base/base-http-exception';
import { ParsePositiveIntStringPipe } from '@common/pipes/positive-int-string.pipe';

describe(ParsePositiveIntStringPipe.name, () => {
  let pipe: ParsePositiveIntStringPipe;

  beforeEach(() => {
    pipe = new ParsePositiveIntStringPipe();
  });

  it('값이 string타입의 int format이라면 number 타입으로 변환된 값을 반환해야한다.', () => {
    expect(pipe.transform('123', {} as ArgumentMetadata)).toEqual('123');
  });

  it('값이 string타입의 0이하의 값이라면 에러를 발생해야한다.', () => {
    expect(() =>
      pipe.transform(
        faker.string.alphanumeric({ length: { min: -100, max: 0 } }),
        {} as ArgumentMetadata,
      ),
    ).toThrow(BaseHttpException);
  });

  it('값이 string타입이 아니라면 에러를 발생해야한다.', () => {
    expect(() => pipe.transform(123, {} as ArgumentMetadata)).toThrow(
      BaseHttpException,
    );
  });

  it('값이 string타입의 int format이 아니라면 에러가 발생해야한다.', () => {
    expect(() =>
      pipe.transform('not-a-number', {} as ArgumentMetadata),
    ).toThrow(BaseHttpException);
  });
});
