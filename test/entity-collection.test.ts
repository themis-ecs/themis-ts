import { All, Pipeline, WorldBuilder } from '../src';
import { EntitySystem } from '../src';
import { ThemisWorld } from '../src/internal/core/world';
import { Entity } from '../src';

test('entity collection test', () => {
  let update = (dt: number) => {};

  const mainPipeline = Pipeline('main')
    .systems(new TestSystem())
    .setup((pipeline) => {
      update = (dt) => pipeline.update(dt);
    });

  const world = new WorldBuilder().pipeline(mainPipeline).build() as ThemisWorld;

  update(1);

  const entity = world.getEntity(0);
  expect(entity.getComponent(TestComponentA).name).toEqual('test');
});

class TestComponentA {
  name!: string;
}

@All(TestComponentA)
class TestSystem extends EntitySystem {
  onInit(): void {
    this.getWorld().createEntity().addComponent(new TestComponentA());
  }

  onUpdate(dt: number): void {
    this.getEntities().forEach((entity) => {
      entity.getComponent(TestComponentA).name = 'test';
    });
  }

  onEntityAdd(entity: Entity): void {}

  onEntityRemove(entity: Entity): void {}
}
