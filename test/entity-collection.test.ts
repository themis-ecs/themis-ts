import { WorldBuilder } from '../src';
import { EntitySystem } from '../src';
import { ComponentSetBuilder } from '../src';
import { ThemisWorld } from '../src/internal/world';

test('entity collection test', () => {
  const world = new WorldBuilder().with(new TestSystem()).build() as ThemisWorld;

  world.update(1);

  const entity = world.getEntity(0);
  expect(entity.getComponent(TestComponentA).name).toEqual('test');
});

class TestComponentA {
  name!: string;
}

class TestSystem extends EntitySystem {
  initComponentSet(componentSetBuilder: ComponentSetBuilder): ComponentSetBuilder {
    return componentSetBuilder.containingAll(TestComponentA);
  }

  onInit(): void {
    this.getWorld().createEntity().addComponent(new TestComponentA());
  }

  onUpdate(dt: number): void {
    this.getEntities().forEach((entity) => {
      entity.getComponent(TestComponentA).name = 'test';
    });
  }
}
