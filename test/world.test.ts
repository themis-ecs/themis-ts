import { all, any, ComponentBase, ComponentQuery, none, Pipeline, Query, System, World, WorldBuilder } from '../src';
import { ThemisWorld } from '../src/internal/core/world';

test('integration test', () => {
  const entitySystemA = new TestEntitySystemA();
  const entitySystemB = new TestEntitySystemB();
  const entitySystemC = new TestEntitySystemC();

  let update = (dt: number) => {};

  const mainPipeline = Pipeline('main')
    .systems(entitySystemA, entitySystemB, entitySystemC)
    .setup((pipeline) => {
      update = (dt) => pipeline.update(dt);
    });

  const world = new WorldBuilder().pipeline(mainPipeline).build() as ThemisWorld;

  let entity1 = world.createEntityId();
  world.addComponent(entity1, new TestComponentA());
  world.addComponent(entity1, new TestComponentB());
  world.addComponent(entity1, new TestComponentC());
  world.addComponent(entity1, new TestComponentD());

  let entity2 = world.createEntityId();
  world.addComponent(entity2, new TestComponentA());
  world.addComponent(entity2, new TestComponentB());

  let entity3 = world.createEntityId();
  world.addComponent(entity3, new TestComponentB());
  world.addComponent(entity3, new TestComponentC());

  let entity4 = world.createEntityId();
  world.addComponent(entity4, new TestComponentA());
  world.addComponent(entity4, new TestComponentD());

  update(0);
  expect(entitySystemA.query.entities.getIds()).toStrictEqual([entity1, entity2, entity4]);
  expect(entitySystemB.query.entities.getIds()).toStrictEqual([entity1, entity4]);
  expect(entitySystemC.query.entities.getIds()).toStrictEqual([entity3]);

  world.removeComponent(entity1, TestComponentA);
  world.removeComponent(entity2, TestComponentA);

  update(0);
  expect(entitySystemA.query.entities.getIds()).toStrictEqual([entity1, entity4]);
  expect(entitySystemB.query.entities.getIds()).toStrictEqual([entity4]);
  expect(entitySystemC.query.entities.getIds()).toStrictEqual([entity1, entity2, entity3]);

  world.deleteEntityById(entity1);
  update(0);
  expect(entitySystemA.query.entities.getIds()).toStrictEqual([entity4]);
  expect(entitySystemB.query.entities.getIds()).toStrictEqual([entity4]);
  expect(entitySystemC.query.entities.getIds()).toStrictEqual([entity2, entity3]);
  expect(world.createEntityId()).toEqual(entity1);
});

class TestComponentA extends ComponentBase {}
class TestComponentB extends ComponentBase {}
class TestComponentC extends ComponentBase {}
class TestComponentD extends ComponentBase {}

class TestEntitySystemA implements System {
  @ComponentQuery(any(TestComponentA, TestComponentD))
  query!: Query;

  init(world: World): void {}

  update(o: number): void {}
}

class TestEntitySystemB implements System {
  @ComponentQuery(all(TestComponentA, TestComponentD))
  query!: Query;

  init(world: World): void {}

  update(o: number): void {}
}

class TestEntitySystemC implements System {
  @ComponentQuery(none(TestComponentA))
  query!: Query;

  init(world: World): void {}

  update(o: number): void {}
}
