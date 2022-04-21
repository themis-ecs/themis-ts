import { all, ComponentQuery, OnUpdate, Pipeline, Query, System, WorldBuilder } from '../src';
import { ThemisEntity } from '../src/internal/core/entity';
import { ThemisWorld } from '../src/internal/core/world';

test('entity test', () => {
  let update = (dt: number) => {};

  const mainPipeline = Pipeline('main')
    .systems(new TestSystem())
    .setup((pipeline) => {
      update = (dt) => pipeline.update(dt);
    });

  const world = new WorldBuilder().pipeline(mainPipeline).build() as ThemisWorld;

  const entity = new ThemisEntity(world, world.createEntityId());
  entity.addComponent(TestComponentA, 'test');
  update(1);
  expect(entity.getComponent(TestComponentA).name).toEqual('test');
  entity.removeComponent(TestComponentA);
  update(2);
  expect(entity.getComponent(TestComponentA)).toBeUndefined();
});

class TestComponentA {
  constructor(public name: string) {}
}

@System()
class TestSystem implements OnUpdate {
  @ComponentQuery(all(TestComponentA))
  query!: Query;

  update(dt: number): void {
    if (dt === 1) {
      expect(this.query.entities.size()).toEqual(1);
    } else if (dt === 2) {
      expect(this.query.entities.size()).toEqual(0);
    } else {
      fail();
    }
  }
}
