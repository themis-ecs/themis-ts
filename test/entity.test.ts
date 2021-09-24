import { All, Pipeline, WorldBuilder } from '../src';
import { Entity } from '../src/internal/core/entity';
import { ThemisWorld } from '../src/internal/core/world';
import { EntitySystem } from '../src';
import { ComponentSetBuilder } from 'internal/core/component-set-builder';

test('entity test', () => {
  let update = (dt: number) => {};

  const mainPipeline = Pipeline('main')
    .systems(new TestSystem())
    .update((pipeline) => {
      update = (dt) => pipeline.update(dt);
    });

  const world = new WorldBuilder().pipeline(mainPipeline).build() as ThemisWorld;

  const entity = new Entity(world, world.createEntityId());
  const testComponentA = new TestComponentA();
  testComponentA.name = 'test';
  entity.addComponent(testComponentA);
  update(1);
  expect(entity.getComponent(TestComponentA).name).toEqual('test');
  entity.removeComponent(TestComponentA);
  update(2);
  expect(entity.getComponent(TestComponentA)).toBeUndefined();
});

class TestComponentA {
  name!: string;
}

@All(TestComponentA)
class TestSystem extends EntitySystem {
  initComponentSet(componentSetBuilder: ComponentSetBuilder): ComponentSetBuilder {
    return componentSetBuilder.containingAll(TestComponentA);
  }

  onInit(): void {}

  onUpdate(dt: number): void {
    if (dt === 1) {
      expect(this.getEntities().size()).toEqual(1);
    } else if (dt === 2) {
      expect(this.getEntities().size()).toEqual(0);
    } else {
      fail();
    }
  }

  onEntityAdd(entity: Entity): void {}

  onEntityRemove(entity: Entity): void {}
}
