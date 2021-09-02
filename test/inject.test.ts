import { Container } from '../src/internal/di/container';
import { Inject } from '../src';

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
  private a!: TestClassA;

  @Inject('test')
  private b!: TestClassB;

  public getA(): TestClassA {
    return this.a;
  }

  public getB(): TestClassB {
    return this.b;
  }
}
