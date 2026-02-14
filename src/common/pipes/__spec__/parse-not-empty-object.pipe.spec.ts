import { BaseHttpException } from '@common/base/base-http-exception';
import { ParseNotEmptyObjectPipe } from '@common/pipes/parse-not-empty-object.pipe';

describe(ParseNotEmptyObjectPipe.name, () => {
  let pipe: ParseNotEmptyObjectPipe;

  beforeEach(() => {
    pipe = new ParseNotEmptyObjectPipe();
  });

  it('empty object라면 에러가 발생해야한다.', () => {
    expect(() => pipe.transform({})).toThrow(BaseHttpException);
  });

  it('empty object가 아니라면 value를 그대로 반환해야한다.', () => {
    expect(pipe.transform({ key: 'value' })).toEqual({ key: 'value' });
  });
});
