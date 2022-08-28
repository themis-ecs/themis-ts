import { all, any, ComponentBase, ComponentQuery, Module, none, Query, System, WorldBuilder } from '../src';
import { ThemisWorld } from '../src/internal/core/world';

test('integration test', () => {
  const world = new WorldBuilder().module(TestModule).build() as ThemisWorld;

  const entitySystemA = world.resolve(TestEntitySystemA, TestModule)!;
  const entitySystemB = world.resolve(TestEntitySystemB, TestModule)!;
  const entitySystemC = world.resolve(TestEntitySystemC, TestModule)!;

  let entity1 = world.createEntityId();
  world.addComponent(entity1, TestComponentA);
  world.addComponent(entity1, TestComponentB);
  world.addComponent(entity1, TestComponentC);
  world.addComponent(entity1, TestComponentD);

  let entity2 = world.createEntityId();
  world.addComponent(entity2, TestComponentA);
  world.addComponent(entity2, TestComponentB);

  let entity3 = world.createEntityId();
  world.addComponent(entity3, TestComponentB);
  world.addComponent(entity3, TestComponentC);

  let entity4 = world.createEntityId();
  world.addComponent(entity4, TestComponentA);
  world.addComponent(entity4, TestComponentD);

  world.update(0);
  expect(entitySystemA.query.entities.getIds()).toEqual(new Uint32Array([entity1, entity2, entity4]));
  expect(entitySystemB.query.entities.getIds()).toEqual(new Uint32Array([entity1, entity4]));
  expect(entitySystemC.query.entities.getIds()).toEqual(new Uint32Array([entity3]));

  world.removeComponent(entity1, TestComponentA);
  world.removeComponent(entity2, TestComponentA);

  world.update(0);
  expect(entitySystemA.query.entities.getIds()).toEqual(new Uint32Array([entity1, entity4]));
  expect(entitySystemB.query.entities.getIds()).toEqual(new Uint32Array([entity4]));
  expect(entitySystemC.query.entities.getIds()).toEqual(new Uint32Array([entity1, entity2, entity3]));

  world.deleteEntityById(entity1);
  world.update(0);
  expect(entitySystemA.query.entities.getIds()).toEqual(new Uint32Array([entity4]));
  expect(entitySystemB.query.entities.getIds()).toEqual(new Uint32Array([entity4]));
  expect(entitySystemC.query.entities.getIds()).toEqual(new Uint32Array([entity2, entity3]));
  expect(world.createEntityId()).toEqual(entity1);
});

class TestComponentA extends ComponentBase {}
class TestComponentB extends ComponentBase {}
class TestComponentC extends ComponentBase {}
class TestComponentD extends ComponentBase {}

@System()
class TestEntitySystemA {
  @ComponentQuery(any(TestComponentA, TestComponentD))
  query!: Query;
}

@System()
class TestEntitySystemB {
  @ComponentQuery(all(TestComponentA, TestComponentD))
  query!: Query;
}

@System()
class TestEntitySystemC {
  @ComponentQuery(none(TestComponentA))
  query!: Query;
}

@Module({
  systems: [TestEntitySystemA, TestEntitySystemB, TestEntitySystemC]
})
class TestModule {}
