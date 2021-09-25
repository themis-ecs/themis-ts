import { Inject } from '../src';
import { Container } from '../src/internal/di/container';

test('Inject Test', () => {
  const container = new Container();
  container.register(TestClassA, new TestClassA());
  container.register('test', new TestClassB());

  const testClass = new InjectTestClass();
  container.inject(testClass);

  expect(testClass.getA().name).toEqual('test');
  expect(testClass.getB().number).toEqual(5);
});

class TestClassA {
  name = 'test';
}

class TestClassB {
  number = 5;
}

class InjectTestClass {
  @Inject(TestClassA)
  a!: TestClassA;

  @Inject('test')
  b!: TestClassB;

  public getA(): TestClassA {
    return this.a;
  }

  public getB(): TestClassB {
    return this.b;
  }
}
