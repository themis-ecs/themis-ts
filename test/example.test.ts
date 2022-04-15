import { all, ComponentQuery, Inject, Module, Pipeline, Query, System, World, WorldBuilder } from '../src';

test('Example', () => {
  new WorldBuilder().module(MyModule).build();
});

class MyComponentA {
  value: number = 13;
}

class MyComponentB {
  value: string = 'the brown fox is not quick today';
}

class MySystem implements System {
  @Inject()
  private world!: World;

  init(): void {
    console.log('hello from MySystem');
    const entity = this.world.createEntity();
    entity.addComponent(MyComponentA);
    entity.addComponent(MyComponentB);
  }

  update(dt: number): void {
    console.log('hello from update, dt is ', dt);
  }
}

class MyComponentQuerySystem implements System {
  @ComponentQuery(all(MyComponentA, MyComponentB))
  private query!: Query;

  init(): void {}

  update(): void {
    this.query.entities.forEach((entity) => {
      console.log(entity.getComponent(MyComponentA).value);
      console.log(entity.getComponent(MyComponentB).value);
    });
  }
}

@Module({
  systems: [MySystem, MyComponentQuerySystem],
  providers: [],
  imports: []
})
class MySubModule {
  init(): void {
    console.log('hello from MySubModule');
  }
}

@Module({
  systems: [],
  providers: [],
  imports: [MySubModule]
})
class MyModule {
  init(pipeline: Pipeline): void {
    console.log('hello from MyModule');
    pipeline.update(42);
  }
}
