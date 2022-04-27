import { all, Blueprint, ComponentQuery, OnUpdate, Pipeline, Query, System, WorldBuilder } from '../src';

const performance = require('perf_hooks').performance;

const numberOfEntities = 10000;

test('Simple Blueprint Performance Test', () => {
  const mainPipeline = Pipeline('main')
    .systems(new TestSystem())
    .setup(() => {});

  const world1 = new WorldBuilder().pipeline(mainPipeline).build();
  const world2 = new WorldBuilder().pipeline(mainPipeline).build();

  world1.registerBlueprint(
    Blueprint('test')
      .component(TestComponentA, 'somevalue')
      .component(TestComponentB)
      .component(TestComponentC)
      .component(TestComponentD)
      .initialize(() => {
        //empty
      })
  );

  for (let i = 0; i < numberOfEntities; i++) {
    world1.createEntity('test');
  }

  for (let i = 0; i < numberOfEntities; i++) {
    world2.createEntity().addComponents(TestComponentA, TestComponentB, TestComponentC, TestComponentD);
  }

  // Performance check with blueprint:
  let t0 = performance.now();
  for (let i = 0; i < numberOfEntities; i++) {
    world1.createEntity('test');
  }
  let t1 = performance.now();
  console.log('With blueprint: ' + (t1 - t0));

  // Performance check without blueprint:

  t0 = performance.now();
  for (let i = 0; i < numberOfEntities; i++) {
    world2
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
