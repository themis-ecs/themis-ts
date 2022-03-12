import { WorldBuilder } from '../src';
import { ThemisWorld } from '../src/internal/core/world';
import { ComponentBase } from '../src';

test('Simple Alias Test', () => {
  const world = new WorldBuilder().build() as ThemisWorld;

  world.registerBlueprint({
    name: 'test',
    components: [
      { type: TestComponentA, component: new TestComponentA() },
      { type: TestComponentB, component: new TestComponentB() },
      { type: TestComponentC, component: new TestComponentC() },
      { type: TestComponentD, component: new TestComponentD() }
    ]
  });

  world.createEntity('test').setAlias('aliastest').getComponent(TestComponentA).value = 'stringvalue';

  world.createEntity('test').setAlias('anotheralias').getComponent(TestComponentB).value = 42;

  expect(world.getEntity('aliastest').getComponent(TestComponentA).value).toEqual('stringvalue');
  expect(world.getEntity('anotheralias').getComponent(TestComponentB).value).toEqual(42);
});

class TestComponentA extends ComponentBase {
  value!: string;
}
class TestComponentB extends ComponentBase {
  value!: number;
}
class TestComponentC extends ComponentBase {}
class TestComponentD extends ComponentBase {}
