import { WorldBuilder } from '../src';
import { EntitySystem } from '../src';
import { Component } from '../src';
import { ComponentSetBuilder } from '../src';

const performance = require('perf_hooks').performance;

test('Simple Blueprint Performance Test', () => {
  const world = new WorldBuilder().with(new TestSystem()).build();

  world.registerBlueprint({
    name: 'test',
    components: [
      { type: TestComponentA, component: new TestComponentA() },
      { type: TestComponentB, component: new TestComponentB() },
      { type: TestComponentC, component: new TestComponentC() },
      { type: TestComponentD, component: new TestComponentD() }
    ]
  });

  for (let i = 0; i < 100; i++) {
    world.createEntity('test');
  }

  for (let i = 0; i < 100; i++) {
    world
      .createEntity()
      .addComponent(new TestComponentA(), new TestComponentB(), new TestComponentC(), new TestComponentD());
  }

  // Performance check with blueprint:
  let t0 = performance.now();
  for (let i = 0; i < 1000; i++) {
    world.createEntity('test');
  }
  let t1 = performance.now();
  console.log('With blueprint: ' + (t1 - t0));

  // Performance check without blueprint:

  t0 = performance.now();
  for (let i = 0; i < 1000; i++) {
    world
      .createEntity()
      .addComponent(new TestComponentA(), new TestComponentB(), new TestComponentC(), new TestComponentD());
  }
  t1 = performance.now();
  console.log('Without blueprint: ' + (t1 - t0));
});

class TestComponentA extends Component {}
class TestComponentB extends Component {}
class TestComponentC extends Component {}
class TestComponentD extends Component {}

class TestSystem extends EntitySystem {
  protected initComponentSet(componentSetBuilder: ComponentSetBuilder): ComponentSetBuilder {
    return componentSetBuilder.containingAll(TestComponentA, TestComponentB);
  }

  onInit(): void {}

  onUpdate(dt: number): void {
    this.getEntities().forEach((entity) => {
      // entity.removeComponent(TestComponentA, TestComponentB).addComponent(new TestComponentC(), new TestComponentD());
      entity.getComponent(TestComponentA);
      entity.getComponent(TestComponentB);
    });
  }
}
