import { Inject, Module, Pipeline, System, World, WorldBuilder } from '../src';

let systemInit = false;
let moduleInit = false;
let update = false;

test('Module Test', () => {
  new WorldBuilder().module(MyModule).build();
  expect(systemInit).toBe(true);
  expect(moduleInit).toBe(true);
  expect(update).toBe(true);
});

class MySystem implements System {
  init(): void {
    systemInit = true;
  }

  update(dt: number): void {
    update = true;
    expect(dt).toEqual(42);
  }
}

class TestClass {
  public value = 13;
}

@Module({
  systems: [MySystem],
  providers: [
    { provide: 'test1', useValue: 5 },
    { provide: 'test2', useClass: TestClass },
    { provide: 'test3', useFactory: () => 42 }
  ]
})
class MyModule {
  @Inject('test1')
  private test1!: number;

  @Inject('test2')
  private test2!: TestClass;

  @Inject('test3')
  private test3!: number;

  constructor(private world: World) {}

  init(pipeline: Pipeline<number>): void {
    moduleInit = true;
    const entity = this.world.createEntity();
    expect(entity).toBeDefined();
    expect(entity.getEntityId()).toEqual(0);
    expect(this.test1).toEqual(5);
    expect(this.test2.value).toEqual(13);
    expect(this.test3).toEqual(42);
    pipeline.update(42);
  }
}
