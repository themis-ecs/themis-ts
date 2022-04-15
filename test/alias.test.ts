import { Blueprint, WorldBuilder } from '../src';
import { ThemisWorld } from '../src/internal/core/world';

test('Simple Alias Test', () => {
  const world = new WorldBuilder().build() as ThemisWorld;

  world.registerBlueprint(
    Blueprint('test')
      .component(TestComponentA)
      .component(TestComponentB, 0)
      .component(TestComponentC)
      .component(TestComponentD)
  );

  world.createEntity('test').setAlias('aliastest').getComponent(TestComponentA).value = 'stringvalue';

  world.createEntity('test').setAlias('anotheralias').getComponent(TestComponentB).value = 42;

  expect(world.getEntity('aliastest').getComponent(TestComponentA).value).toEqual('stringvalue');
  expect(world.getEntity('anotheralias').getComponent(TestComponentB).value).toEqual(42);
});

class TestComponentA {
  constructor(public value: string = '') {}
}
class TestComponentB {
  constructor(public value: number) {}
}
class TestComponentC {}
class TestComponentD {}
