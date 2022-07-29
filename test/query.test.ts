import { all, any, Blueprint, Module, none, Pipeline, WorldBuilder } from '../src';

test('Component Query Test', () => {
  const world = new WorldBuilder().build();

  const entity1 = world.createEntity();
  const entity2 = world.createEntity();
  const entity3 = world.createEntity();

  entity1.addComponent(ComponentA);
  entity1.addComponent(ComponentB);

  entity2.addComponent(ComponentB);
  entity2.addComponent(ComponentC);

  entity3.addComponent(ComponentA);
  entity3.addComponent(ComponentC);

  expect(world.query(all(ComponentA, ComponentB)).entities.getIds()).toEqual(new Uint32Array([entity1.getEntityId()]));
  expect(world.query(all(ComponentB, ComponentC)).entities.getIds()).toEqual(new Uint32Array([entity2.getEntityId()]));
  expect(world.query(all(ComponentA, ComponentC)).entities.getIds()).toEqual(new Uint32Array([entity3.getEntityId()]));

  expect(world.query(any(ComponentA)).entities.getIds()).toEqual(
    new Uint32Array([entity1.getEntityId(), entity3.getEntityId()])
  );
  expect(world.query(any(ComponentB)).entities.getIds()).toEqual(
    new Uint32Array([entity1.getEntityId(), entity2.getEntityId()])
  );
  expect(world.query(any(ComponentC)).entities.getIds()).toEqual(
    new Uint32Array([entity2.getEntityId(), entity3.getEntityId()])
  );

  expect(world.query(none(ComponentA)).entities.getIds()).toEqual(new Uint32Array([entity2.getEntityId()]));
  expect(world.query(none(ComponentB)).entities.getIds()).toEqual(new Uint32Array([entity3.getEntityId()]));
  expect(world.query(none(ComponentC)).entities.getIds()).toEqual(new Uint32Array([entity1.getEntityId()]));
});

let update: (dt: number) => void;

test('Component Query with Blueprint Test', () => {
  const world = new WorldBuilder().module(TestModule).build();
  world.registerBlueprint(Blueprint('test').component(ComponentA).component(ComponentB));
  const query = world.query(all(ComponentA, ComponentB));
  const entity = world.createEntity('test');
  update(0);
  const queryEntity = query.entities.getEntities()[0];
  expect(queryEntity).toBe(entity);
});

class ComponentA {}

class ComponentB {}

class ComponentC {}

@Module({})
class TestModule {
  init(pipeline: Pipeline): void {
    update = (dt) => pipeline.update(dt);
  }
}
