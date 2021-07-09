import { WorldBuilder } from '../src';
import { System } from '../src';
import { Mapper } from '../src/internal/decorator';
import { ComponentMapper } from '../src/internal/component-mapper';
import { ThemisWorld } from '../src/internal/world';

test('Component Mapper Inject Test', () => {
  const world = new WorldBuilder().with(new TestSystem()).build() as ThemisWorld;
  expect(world.getComponentMapper(ComponentA).getComponent(0).name).toEqual('test');
  expect(world.getComponentMapper(ComponentB).getComponent(0).i).toEqual(42);
});

class ComponentA {
  name!: string;
}

class ComponentB {
  i!: number;
}

class TestSystem extends System {
  @Mapper(ComponentA)
  private readonly componentAMapper!: ComponentMapper<ComponentA>;
  @Mapper(ComponentB)
  private readonly componentBMapper!: ComponentMapper<ComponentB>;

  onInit(): void {
    const entity = (this.getWorld() as ThemisWorld).createEntityId();
    const componentA = new ComponentA();
    componentA.name = 'test';
    const componentB = new ComponentB();
    componentB.i = 42;
    this.componentAMapper.addComponent(entity, componentA);
    this.componentBMapper.addComponent(entity, componentB);
  }

  onUpdate(): void {}
}
