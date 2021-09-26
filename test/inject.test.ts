import { Inject, WorldBuilder } from '../src';

test('Inject Test', () => {
  const builder = new WorldBuilder();
  builder.register(TestClassA, new TestClassA());
  builder.register('test', new TestClassB());
  const world = builder.build();
  const testClass = new InjectTestClass();
  world.inject(testClass);

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
