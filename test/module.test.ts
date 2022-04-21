import { Inject, Module, OnInit, OnUpdate, Pipeline, System, World, WorldBuilder } from '../src';

let systemInit = false;
let moduleInit = false;
let subModule1Init = false;
let subModule2Init = false;
let subModule3Init = false;
let update = false;
const initOrderArray: number[] = [];

test('Module Test', () => {
  new WorldBuilder().module(MyModule).build();
  expect(systemInit).toBe(true);
  expect(moduleInit).toBe(true);
  expect(subModule1Init).toBe(true);
  expect(subModule2Init).toBe(true);
  expect(subModule3Init).toBe(true);
  expect(update).toBe(true);
  expect(initOrderArray).toEqual([3, 1, 2, 0]);
});

@System()
class MySystem implements OnInit, OnUpdate {
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
  systems: []
})
class SubModule3 {
  init(): void {
    subModule3Init = true;
    initOrderArray.push(3);
  }
}

@Module({
  systems: [MySystem],
  imports: [SubModule3]
})
class SubModule1 {
  init(): void {
    subModule1Init = true;
    initOrderArray.push(1);
  }
}

@Module({
  providers: [{ provide: 'test3', useFactory: () => 42 }]
})
class SubModule2 {
  init(): void {
    subModule2Init = true;
    initOrderArray.push(2);
  }
}

@Module({
  providers: [
    { provide: 'test1', useValue: 5 },
    { provide: 'test2', useClass: TestClass }
  ],
  imports: [SubModule1, SubModule2]
})
class MyModule {
  @Inject('test1')
  private test1!: number;

  @Inject('test2')
  private test2!: TestClass;

  @Inject('test3')
  private test3!: number;

  constructor(private world: World) {}

  init(pipeline: Pipeline): void {
    moduleInit = true;
    const entity = this.world.createEntity();
    expect(entity).toBeDefined();
    expect(entity.getEntityId()).toEqual(0);
    expect(this.test1).toEqual(5);
    expect(this.test2.value).toEqual(13);
    expect(this.test3).toEqual(42);
    pipeline.update(42);
    initOrderArray.push(0);
  }
}
