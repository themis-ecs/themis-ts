import { all, ComponentQuery, Inject, OnInit, OnUpdate, Pipeline, Query, System, World, WorldBuilder } from '../src';
import { ThemisWorld } from '../src/internal/core/world';

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

@System()
class TestSystem implements OnInit, OnUpdate {
  @ComponentQuery(all(TestComponentA))
  query!: Query;

  @Inject()
  world!: World;

  init(): void {
    this.world.createEntity().addComponent(TestComponentA);
  }

  update(): void {
    this.query.entities.forEach((entity) => {
      entity.getComponent(TestComponentA).name = 'test';
    });
  }
}
