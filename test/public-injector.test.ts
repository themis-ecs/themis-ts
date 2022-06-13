import { Injectable, Module } from '../src';
import { Injector } from '../src/public/injector';
import { Container } from '../src/internal/ioc/container';

test('Public Injector Test', () => {
  const container = new Container();
  container.registerModule(ModuleA);

  const serviceC = container.resolve(ServiceC, ModuleA)!;
  serviceC.test();

  const serviceA = container.resolve(ServiceA, ModuleA)!;
  const serviceB = container.resolve(ServiceB, ModuleA)!;

  expect(serviceA.value).toEqual(10);
  expect(serviceB.value).toEqual('works');
});

@Injectable()
class ServiceA {
  public value = 5;
}

@Injectable()
class ServiceB {
  public value = 'test';
}

@Injectable()
class ServiceC {
  constructor(private injector: Injector) {}

  public test(): void {
    this.injector.resolve(ServiceA)!.value = 10;
    this.injector.resolve(ServiceB)!.value = 'works';
  }
}

@Module({
  systems: [],
  providers: [ServiceA, ServiceB, ServiceC],
  imports: [],
  exports: []
})
class ModuleA {}
