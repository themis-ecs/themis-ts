import { All, WorldBuilder } from '../src';
import { EntitySystem } from '../src';
import { ThemisWorld } from '../src/internal/core/world';
import { Entity } from '../dist';

test('entity collection test', () => {
  const world = new WorldBuilder().with(new TestSystem()).build() as ThemisWorld;

  world.update(1);

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
