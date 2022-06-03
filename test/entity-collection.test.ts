import {
  all,
  ComponentQuery,
  Inject,
  Module,
  OnInit,
  OnUpdate,
  Pipeline,
  Query,
  System,
  World,
  WorldBuilder
} from '../src';
import { ThemisWorld } from '../src/internal/core/world';

let update: (dt: number) => void;

test('entity collection test', () => {
  const world = new WorldBuilder().module(TestModule).build() as ThemisWorld;

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

@Module({
  systems: [TestSystem]
})
class TestModule {
  init(pipeline: Pipeline): void {
    update = (dt) => pipeline.update(dt);
  }
}
