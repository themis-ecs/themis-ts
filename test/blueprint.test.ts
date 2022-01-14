import { all, Component, ComponentQuery, Entity, Pipeline, QueryResult, System, WorldBuilder } from '../src';

const performance = require('perf_hooks').performance;

test('Simple Blueprint Performance Test', () => {
  const mainPipeline = Pipeline('main')
    .systems(new TestSystem())
    .setup(() => {});

  const world = new WorldBuilder().pipeline(mainPipeline).build();

  world.registerBlueprint({
    name: 'test',
    components: [
      { type: TestComponentA, component: new TestComponentA() },
      { type: TestComponentB, component: new TestComponentB() },
      { type: TestComponentC, component: new TestComponentC() },
      { type: TestComponentD, component: new TestComponentD() }
    ],
    initialize: (entity) => {
      entity.getEntityId() + 1;
    }
  });

  for (let i = 0; i < 10000; i++) {
    world.createEntity('test');
  }

  for (let i = 0; i < 10000; i++) {
    world
      .createEntity()
      .addComponent(new TestComponentA(), new TestComponentB(), new TestComponentC(), new TestComponentD());
  }

  // Performance check with blueprint:
  let t0 = performance.now();
  for (let i = 0; i < 100000; i++) {
    world.createEntity('test');
  }
  let t1 = performance.now();
  console.log('With blueprint: ' + (t1 - t0));

  // Performance check without blueprint:

  t0 = performance.now();
  for (let i = 0; i < 100000; i++) {
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

class TestSystem implements System {
  @ComponentQuery(all(TestComponentA, TestComponentB))
  result!: QueryResult;

  init(): void {}

  update(dt: number): void {
    this.result.forEach((entity) => {
      // entity.removeComponent(TestComponentA, TestComponentB).addComponent(new TestComponentC(), new TestComponentD());
      entity.getComponent(TestComponentA);
      entity.getComponent(TestComponentB);
    });
  }

  onEntityAdd(entity: Entity): void {}

  onEntityRemove(entity: Entity): void {}
}
