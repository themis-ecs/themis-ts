import { System } from 'public/system';
import { ThemisWorld } from './world';
import { EventRegistry } from './event-registry';
import { ComponentRegistry } from './component-registry';
import { EntityRegistry } from './entity-registry';
import { Pipeline } from '../../public/pipeline';

/**
 * @internal
 */
export class ThemisPipeline implements Pipeline {
  private readonly id: string;
  private readonly systems: Array<System>;
  private readonly entityRegistry: EntityRegistry;
  private readonly componentRegistry: ComponentRegistry;
  private readonly eventRegistry: EventRegistry;

  constructor(
    id: string,
    systems: Array<System>,
    entityRegistry: EntityRegistry,
    componentRegistry: ComponentRegistry,
    eventRegistry: EventRegistry
  ) {
    this.id = id;
    this.systems = systems;
    this.entityRegistry = entityRegistry;
    this.componentRegistry = componentRegistry;
    this.eventRegistry = eventRegistry;
  }

  public getId(): string {
    return this.id;
  }

  public init(world: ThemisWorld): void {
    this.systems.forEach((system) => system.init(world));
  }

  public registerListeners(): void {
    this.systems.forEach((system) => system.registerListeners());
  }

  public onInit(): void {
    this.systems.forEach((system) => system.onInit()); // double init method will be removed in refactoring of Systems API (https://github.com/themis-ecs/themis-ts/issues/10)
  }

  public update(dt: number): void {
    this.entityRegistry.update();
    this.componentRegistry.update();
    this.systems.forEach((system) => system.update(dt));
    this.eventRegistry.update();
  }
}
