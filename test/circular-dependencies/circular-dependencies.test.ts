import { Container } from '../../src/internal/ioc/container';
import { TestModule } from './test.module';
import { ServiceA } from './a.service';
import { ServiceB } from './b.service';

test('CircularDependenciesTest', () => {
  const container = new Container();
  container.registerModule(TestModule);

  const serviceA = container.resolve(ServiceA, TestModule)!;
  const serviceB = container.resolve(ServiceB, TestModule)!;

  serviceA.serviceB.value = 42;

  expect(serviceB.value).toEqual(42);

  serviceB.serviceA.value = 13;
  expect(serviceA.value).toEqual(13);

  expect(serviceA.serviceB).toStrictEqual(serviceB);
  expect(serviceB.serviceA).toStrictEqual(serviceA);
});
