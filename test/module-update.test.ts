import { Module, System, WorldBuilder } from '../src';

let systemA1 = false;
let systemA2 = false;
let systemB1 = false;
let systemB2 = false;
let systemC1 = false;
let systemC2 = false;

test('Module Update Test', () => {
  const world = new WorldBuilder().module(ModuleA).build();

  world.update(0, ModuleC);
  expect(systemA1).toBe(false);
  expect(systemA2).toBe(false);
  expect(systemB1).toBe(false);
  expect(systemB2).toBe(false);
  expect(systemC1).toBe(true);
  expect(systemC2).toBe(true);
  systemA1 = false;
  systemA2 = false;
  systemB1 = false;
  systemB2 = false;
  systemC1 = false;
  systemC2 = false;

  world.update(0, ModuleB);
  expect(systemA1).toBe(false);
  expect(systemA2).toBe(false);
  expect(systemB1).toBe(true);
  expect(systemB2).toBe(true);
  expect(systemC1).toBe(true);
  expect(systemC2).toBe(true);
  systemA1 = false;
  systemA2 = false;
  systemB1 = false;
  systemB2 = false;
  systemC1 = false;
  systemC2 = false;

  world.update(0, ModuleA);
  expect(systemA1).toBe(true);
  expect(systemA2).toBe(true);
  expect(systemB1).toBe(true);
  expect(systemB2).toBe(true);
  expect(systemC1).toBe(true);
  expect(systemC2).toBe(true);
  systemA1 = false;
  systemA2 = false;
  systemB1 = false;
  systemB2 = false;
  systemC1 = false;
  systemC2 = false;

  world.update(0);
  expect(systemA1).toBe(true);
  expect(systemA2).toBe(true);
  expect(systemB1).toBe(true);
  expect(systemB2).toBe(true);
  expect(systemC1).toBe(true);
  expect(systemC2).toBe(true);
});

@System()
export class SystemA1 {
  update(): void {
    systemA1 = true;
  }
}

@System()
export class SystemA2 {
  update(): void {
    systemA2 = true;
  }
}

@System()
export class SystemB1 {
  update(): void {
    systemB1 = true;
  }
}

@System()
export class SystemB2 {
  update(): void {
    systemB2 = true;
  }
}

@System()
export class SystemC1 {
  update(): void {
    systemC1 = true;
  }
}

@System()
export class SystemC2 {
  update(): void {
    systemC2 = true;
  }
}

@Module({
  systems: [SystemC1, SystemC2]
})
export class ModuleC {}

@Module({
  imports: [ModuleC],
  systems: [SystemB1, SystemB2]
})
export class ModuleB {}

@Module({
  imports: [ModuleB],
  systems: [SystemA1, SystemA2]
})
export class ModuleA {}
