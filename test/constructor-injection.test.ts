import { Inject, Injectable, Module } from '../src';
import { Container } from '../src/internal/ioc/container';

let testValue = '';

test('constructor injection test', () => {
  const container = new Container();
  container.registerModule(MyModule);

  const instance = container.resolve(TestClass, MyModule)!;

  expect(instance).toBeDefined();
  expect(testValue).toEqual('works :)');
  expect(Object.getPrototypeOf(instance.dependency).constructor).toEqual(MyConcreteClass);
});

abstract class MyAbstractClass {
  abstract testFunction(): void;
}

@Injectable()
class MyConcreteClass extends MyAbstractClass {
  testFunction(): void {
    testValue = 'works :)';
  }
}

@Injectable()
class TestClass {
  public test = 'test';

  @Inject(MyConcreteClass)
  public dependency!: MyAbstractClass;

  constructor(@Inject(MyConcreteClass) dependency: MyAbstractClass) {
    dependency.testFunction();
  }
}

@Module({
  providers: [TestClass, MyConcreteClass]
})
class MyModule {}
