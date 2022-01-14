import { all, ComponentQuery, Entity, Pipeline, QueryResult, System, World, WorldBuilder } from '../src';
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

class TestSystem implements System {
  @ComponentQuery(all(TestComponentA))
  result!: QueryResult;

  init(world: World): void {
    world.createEntity().addComponent(new TestComponentA());
  }

  update(): void {
    this.result.forEach((entity) => {
      entity.getComponent(TestComponentA).name = 'test';
    });
  }

  onEntityAdd(entity: Entity): void {}

  onEntityRemove(entity: Entity): void {}
}
