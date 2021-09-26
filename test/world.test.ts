import { all, any, ComponentQuery, EntityCollection, none, Pipeline, World, WorldBuilder } from '../src';
import { ThemisWorld } from '../src/internal/core/world';
import { Component } from '../src';
import { System } from '../src';

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

  const componentAMapper = world.getComponentMapper<TestComponentA>(TestComponentA);
  const componentBMapper = world.getComponentMapper<TestComponentB>(TestComponentB);
  const componentCMapper = world.getComponentMapper<TestComponentC>(TestComponentC);
  const componentDMapper = world.getComponentMapper<TestComponentD>(TestComponentD);

  let entity1 = world.createEntityId();
  componentAMapper.addComponent(entity1, new TestComponentA());
  componentBMapper.addComponent(entity1, new TestComponentB());
  componentCMapper.addComponent(entity1, new TestComponentC());
  componentDMapper.addComponent(entity1, new TestComponentD());

  let entity2 = world.createEntityId();
  componentAMapper.addComponent(entity2, new TestComponentA());
  componentBMapper.addComponent(entity2, new TestComponentB());

  let entity3 = world.createEntityId();
  componentBMapper.addComponent(entity3, new TestComponentB());
  componentCMapper.addComponent(entity3, new TestComponentC());

  let entity4 = world.createEntityId();
  componentAMapper.addComponent(entity4, new TestComponentA());
  componentDMapper.addComponent(entity4, new TestComponentD());

  update(0);
  expect(entitySystemA.entities.getIds()).toStrictEqual([entity1, entity2, entity4]);
  expect(entitySystemB.entities.getIds()).toStrictEqual([entity1, entity4]);
  expect(entitySystemC.entities.getIds()).toStrictEqual([entity3]);

  componentAMapper.removeComponent(entity1);
  componentAMapper.removeComponent(entity2);

  update(0);
  expect(entitySystemA.entities.getIds()).toStrictEqual([entity1, entity4]);
  expect(entitySystemB.entities.getIds()).toStrictEqual([entity4]);
  expect(entitySystemC.entities.getIds()).toStrictEqual([entity1, entity2, entity3]);

  world.deleteEntityById(entity1);
  update(0);
  expect(entitySystemA.entities.getIds()).toStrictEqual([entity4]);
  expect(entitySystemB.entities.getIds()).toStrictEqual([entity4]);
  expect(entitySystemC.entities.getIds()).toStrictEqual([entity2, entity3]);
  expect(world.createEntityId()).toEqual(entity1);
});

class TestComponentA extends Component {}
class TestComponentB extends Component {}
class TestComponentC extends Component {}
class TestComponentD extends Component {}

class TestEntitySystemA implements System {
  @ComponentQuery(any(TestComponentA, TestComponentD))
  entities!: EntityCollection;

  init(world: World): void {}

  update(o: number): void {}
}

class TestEntitySystemB implements System {
  @ComponentQuery(all(TestComponentA, TestComponentD))
  entities!: EntityCollection;

  init(world: World): void {}

  update(o: number): void {}
}

class TestEntitySystemC implements System {
  @ComponentQuery(none(TestComponentA))
  entities!: EntityCollection;

  init(world: World): void {}

  update(o: number): void {}
}
