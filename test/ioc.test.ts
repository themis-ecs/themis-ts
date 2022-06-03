import { Container } from '../src/internal/ioc/container';
import { Injectable, Module, REQUEST } from '../src';

test('Container Exports and Imports', () => {
  const container = new Container();
  container.registerModule(ModuleA);

  const serviceA = container.resolve(ServiceA, ModuleA)!;
  expect(serviceA.id).toEqual('ServiceA');
  expect(serviceA.service.id).toEqual('ServiceB');
  expect(serviceA.service.service.id).toEqual('ServiceC');
});

test('Container Scopes', () => {
  const container = new Container();
  container.registerModule(ModuleA);

  const serviceA = container.resolve(ServiceA, ModuleA)!;
  const serviceA2 = container.resolve(ServiceA, ModuleA)!;
  expect(serviceA2).not.toBe(serviceA);
  expect(serviceA2.service).toBe(serviceA.service);
  expect(serviceA2.service.service).toBe(serviceA.service.service);
});

test('Container Encapsulation', () => {
  const container = new Container();
  container.registerModule(ModuleA);

  expect(container.resolve(ServiceA, ModuleA)).toBeDefined();
  expect(container.resolve(ServiceA, ModuleB)).toBeUndefined();
  expect(container.resolve(ServiceA, ModuleC)).toBeUndefined();
  expect(container.resolve(ServiceB, ModuleA)).toBeDefined();
  expect(container.resolve(ServiceB, ModuleB)).toBeDefined();
  expect(container.resolve(ServiceB, ModuleC)).toBeUndefined();
  expect(container.resolve(ServiceC, ModuleA)).toBeUndefined();
  expect(container.resolve(ServiceC, ModuleB)).toBeDefined();
  expect(container.resolve(ServiceC, ModuleC)).toBeDefined();
  expect(container.resolve(ServiceD, ModuleA)).toBeUndefined();
  expect(container.resolve(ServiceD, ModuleB)).toBeUndefined();
  expect(container.resolve(ServiceD, ModuleC)).toBeDefined();
});

@Injectable()
class ServiceD {
  public id = 'ServiceD';
}

@Injectable()
class ServiceC {
  public id = 'ServiceC';
}

@Injectable()
class ServiceB {
  public id = 'ServiceB';
  constructor(public service: ServiceC) {}
}

@Injectable({ scope: REQUEST })
class ServiceA {
  public id = 'ServiceA';
  constructor(public service: ServiceB) {}
}

@Module({
  providers: [ServiceC, ServiceD],
  imports: [],
  exports: [ServiceC]
})
class ModuleC {}

@Module({
  providers: [ServiceB],
  imports: [ModuleC],
  exports: [ServiceB]
})
class ModuleB {}

@Module({
  providers: [ServiceA],
  imports: [ModuleB],
  exports: []
})
class ModuleA {}
