import { WorldBuilder } from '../src';
import { ThemisWorld } from '../src/internal/core/world';
import { Component } from '../src';

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

class TestComponentA extends Component {
  value!: string;
}
class TestComponentB extends Component {
  value!: number;
}
class TestComponentC extends Component {}
class TestComponentD extends Component {}
