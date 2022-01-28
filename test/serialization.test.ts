import { any, Component, ComponentQuery, Pipeline, Query, System, World, WorldBuilder } from '../src';
import { ThemisWorld } from '../src/internal/core/world';

test('Serialization Test', () => {
  let update = (dt: number) => {};

  const mainPipeline = Pipeline('main')
    .systems(TestEntitySystemA)
    .setup((pipeline) => {
      update = (dt) => pipeline.update(dt);
    });

  const world = new WorldBuilder().pipeline(mainPipeline).build() as ThemisWorld;

  const entity = world.createEntity();
  entity.setAlias('testentity');

  const component = new TestComponentA();
  component.a = 'blablabla';
  entity.addComponent(component);

  update(0);

  const data = world.save();

  const world2 = new WorldBuilder().pipeline(mainPipeline).build() as ThemisWorld;

  world2.load(data);

  const entity2 = world2.getEntity('testentity');
  console.log(entity2.getComponent(TestComponentA));
});

@Component({ id: 'test' })
export class TestComponentA {
  a: string = 'test';
}

class TestEntitySystemA implements System {
  @ComponentQuery(any(TestComponentA))
  query!: Query;

  init(world: World): void {}

  update(o: number): void {}
}
