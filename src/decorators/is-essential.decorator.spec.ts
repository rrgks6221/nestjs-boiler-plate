import { IsEssential } from '@src/decorators/is-essential.decorator';
import { faker } from '@faker-js/faker';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

let field: (keyof TestClass)[] = ['essentialField1'];

class TestClass {
  essentialField1;

  essentialField2;

  notEssentialField;

  @IsEssential<TestClass>(field)
  targetField;
}

describe('IsEssential decorator', () => {
  let testInstance: TestClass;
  let randomProp: string;

  beforeEach(() => {
    testInstance = new TestClass();
    randomProp = faker.random.word();
  });

  it('essential field 가 1개 , target field 가 있을 경우', async () => {
    field = ['essentialField1'];

    class TestClass {
      essentialField1;

      essentialField2;

      notEssentialField;

      @IsEssential<TestClass>(field)
      targetField;
    }

    testInstance.targetField = randomProp;
    testInstance.essentialField1 = randomProp;

    const validation = plainToInstance(TestClass, testInstance);

    const errors = await validate(validation);

    expect(testInstance['targetField']).not.toBeUndefined();
    expect(testInstance['essentialField1']).not.toBeUndefined();
    expect(errors).toHaveLength(0);
  });

  it('essential field 가 2개 , target field 가 있을 경우', async () => {
    field = ['essentialField1', 'essentialField2'];

    class TestClass {
      essentialField1;

      essentialField2;

      notEssentialField;

      @IsEssential<TestClass>(field)
      targetField;
    }

    testInstance.targetField = randomProp;
    testInstance.essentialField1 = randomProp;
    testInstance.essentialField2 = randomProp;

    const validation = plainToInstance(TestClass, testInstance);

    const errors = await validate(validation);

    expect(testInstance['targetField']).not.toBeUndefined();
    expect(testInstance['essentialField1']).not.toBeUndefined();
    expect(testInstance['essentialField2']).not.toBeUndefined();
    expect(errors).toHaveLength(0);
  });

  it('essential field 0개 , target field 가 있을 경우', async () => {
    field = [];

    class TestClass {
      essentialField1;

      essentialField2;

      notEssentialField;

      @IsEssential<TestClass>(field)
      targetField;
    }

    testInstance.targetField = randomProp;

    const validation = plainToInstance(TestClass, testInstance);

    const errors = await validate(validation);

    expect(field).toHaveLength(0);
    expect(testInstance['targetField']).not.toBeUndefined();
    expect(errors).toHaveLength(0);
  });

  it('essential field 가 빈 값이고, target field 가 있을 경우', async () => {
    field = ['essentialField1'];

    class TestClass {
      essentialField1;

      essentialField2;

      notEssentialField;

      @IsEssential<TestClass>(field)
      targetField;
    }

    testInstance.targetField = randomProp;

    const validation = plainToInstance(TestClass, testInstance);

    const errors = await validate(validation);

    expect(field).toHaveLength(1);
    expect(testInstance['targetField']).not.toBeUndefined();
    expect(errors).toHaveLength(1);
  });

  afterEach(() => {
    field = undefined;
  });
});
