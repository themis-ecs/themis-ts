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

test('providedIn with singleton scope', () => {
  const container = new Container();
  container.registerModule(ModuleA);

  const instanceA = container.resolve(GlobalService, ModuleA)!;
  const instanceB = container.resolve(GlobalService, ModuleB)!;
  const instanceC = container.resolve(GlobalService, ModuleC)!;

  expect(instanceA).toBe(instanceB);
  expect(instanceA).toBe(instanceC);
  expect(instanceB).toBe(instanceC);

  instanceA.id = 'A';
  instanceB.id = 'B';
  instanceC.id = 'C';

  expect(instanceA.id).toEqual('C');
  expect(instanceB.id).toEqual('C');
  expect(instanceC.id).toEqual('C');
});

test('providedIn with module scope', () => {
  const container = new Container();
  container.registerModule(ModuleA);

  const instanceA = container.resolve(NonGlobalService, ModuleA)!;
  const instanceB = container.resolve(NonGlobalService, ModuleB)!;
  const instanceC = container.resolve(NonGlobalService, ModuleC)!;

  expect(instanceA).not.toBe(instanceB);
  expect(instanceA).not.toBe(instanceC);
  expect(instanceB).not.toBe(instanceC);

  instanceA.id = 'A';
  instanceB.id = 'B';
  instanceC.id = 'C';

  expect(instanceA.id).toEqual('A');
  expect(instanceB.id).toEqual('B');
  expect(instanceC.id).toEqual('C');
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

@Injectable({ providedIn: 'root' })
class GlobalService {
  public id = 'GlobalService';
}

@Injectable({ providedIn: 'module' })
class NonGlobalService {
  public id = 'NonGlobalService';
}

@Module({
  providers: [ServiceC, ServiceD, GlobalService, NonGlobalService],
  imports: [],
  exports: [ServiceC]
})
class ModuleC {}

@Module({
  providers: [ServiceB, GlobalService, NonGlobalService],
  imports: [ModuleC],
  exports: [ServiceB]
})
class ModuleB {}

@Module({
  providers: [ServiceA, GlobalService, NonGlobalService],
  imports: [ModuleB],
  exports: []
})
class ModuleA {}
