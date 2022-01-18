import { all, ComponentQuery, Pipeline, QueryResult, System, WorldBuilder } from '../src';
import { Entity } from '../src/internal/core/entity';
import { ThemisWorld } from '../src/internal/core/world';

test('entity test', () => {
  let update = (dt: number) => {};

  const mainPipeline = Pipeline('main')
    .systems(new TestSystem())
    .setup((pipeline) => {
      update = (dt) => pipeline.update(dt);
    });

  const world = new WorldBuilder().pipeline(mainPipeline).build() as ThemisWorld;

  const entity = new Entity(world, world.createEntityId());
  const testComponentA = new TestComponentA();
  testComponentA.name = 'test';
  entity.addComponent(testComponentA);
  entity.addComponent({ name: 'test' });
  update(1);
  expect(entity.getComponent(TestComponentA).name).toEqual('test');
  entity.removeComponent(TestComponentA);
  update(2);
  expect(entity.getComponent(TestComponentA)).toBeUndefined();
});

class TestComponentA {
  name!: string;
}

class TestSystem implements System {
  @ComponentQuery(all(TestComponentA))
  result!: QueryResult;

  init(): void {}

  update(dt: number): void {
    if (dt === 1) {
      expect(this.result.size()).toEqual(1);
    } else if (dt === 2) {
      expect(this.result.size()).toEqual(0);
    } else {
      fail();
    }
  }
}
