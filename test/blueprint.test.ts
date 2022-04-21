import { all, Blueprint, ComponentQuery, OnUpdate, Pipeline, Query, System, WorldBuilder } from '../src';

const performance = require('perf_hooks').performance;

test('Simple Blueprint Performance Test', () => {
  const mainPipeline = Pipeline('main')
    .systems(new TestSystem())
    .setup(() => {});

  const world = new WorldBuilder().pipeline(mainPipeline).build();

  world.registerBlueprint(
    Blueprint('test')
      .component(TestComponentA, 'somevalue')
      .component(TestComponentB)
      .component(TestComponentC)
      .component(TestComponentD)
      .initialize((entity) => {
        entity.getEntityId() + 1;
      })
  );

  for (let i = 0; i < 10000; i++) {
    world.createEntity('test');
  }

  for (let i = 0; i < 10000; i++) {
    world.createEntity().addComponents(TestComponentA, TestComponentB, TestComponentC, TestComponentD);
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
      .addComponent(TestComponentA, 'somevalue')
      .addComponents(TestComponentB, TestComponentC, TestComponentD);
  }
  t1 = performance.now();
  console.log('Without blueprint: ' + (t1 - t0));
});

class TestComponentA {
  constructor(public value: string) {}
}
class TestComponentB {}
class TestComponentC {}
class TestComponentD {}

@System()
class TestSystem implements OnUpdate {
  @ComponentQuery(all(TestComponentA, TestComponentB))
  query!: Query;

  update(dt: number): void {
    this.query.entities.forEach((entity) => {
      entity.getComponent(TestComponentA);
      entity.getComponent(TestComponentB);
    });
  }
}
