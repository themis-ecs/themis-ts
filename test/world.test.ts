import { WorldBuilder } from '../src';
import { ThemisWorld } from '../src/internal/world';
import { Component } from '../src';
import { ComponentSetBuilder } from '../src';
import { EntitySystem } from '../src';

test('integration test', () => {
  const entitySystemA = new TestEntitySystemA();
  const entitySystemB = new TestEntitySystemB();
  const entitySystemC = new TestEntitySystemC();

  const world = new WorldBuilder().with(entitySystemA, entitySystemB, entitySystemC).build() as ThemisWorld;

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

  world.update(0);
  expect(entitySystemA.getEntities().getIds()).toStrictEqual([entity1, entity2, entity4]);
  expect(entitySystemB.getEntities().getIds()).toStrictEqual([entity1, entity4]);
  expect(entitySystemC.getEntities().getIds()).toStrictEqual([entity3]);

  componentAMapper.removeComponent(entity1);
  componentAMapper.removeComponent(entity2);

  world.update(0);
  expect(entitySystemA.getEntities().getIds()).toStrictEqual([entity1, entity4]);
  expect(entitySystemB.getEntities().getIds()).toStrictEqual([entity4]);
  expect(entitySystemC.getEntities().getIds()).toStrictEqual([entity1, entity2, entity3]);

  world.deleteEntityById(entity1);
  world.update(0);
  expect(entitySystemA.getEntities().getIds()).toStrictEqual([entity4]);
  expect(entitySystemB.getEntities().getIds()).toStrictEqual([entity4]);
  expect(entitySystemC.getEntities().getIds()).toStrictEqual([entity2, entity3]);
  expect(world.createEntityId()).toEqual(entity1);
});

class TestComponentA extends Component {}
class TestComponentB extends Component {}
class TestComponentC extends Component {}
class TestComponentD extends Component {}

class TestEntitySystemA extends EntitySystem {
  onInit(): void {}

  onUpdate(_dt: number): void {}

  initComponentSet(componentSetBuilder: ComponentSetBuilder): ComponentSetBuilder {
    return componentSetBuilder.containingAny(TestComponentA, TestComponentD);
  }
}

class TestEntitySystemB extends EntitySystem {
  onInit(): void {}

  onUpdate(_dt: number): void {}

  initComponentSet(componentSetBuilder: ComponentSetBuilder): ComponentSetBuilder {
    return componentSetBuilder.containingAll(TestComponentA, TestComponentD);
  }
}

class TestEntitySystemC extends EntitySystem {
  onInit(): void {}

  onUpdate(_dt: number): void {}

  initComponentSet(componentSetBuilder: ComponentSetBuilder): ComponentSetBuilder {
    return componentSetBuilder.containingNone(TestComponentA);
  }
}
