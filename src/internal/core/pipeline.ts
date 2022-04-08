import { OnUpdate, System } from 'public/system';
import { EventRegistry } from './event-registry';
import { ComponentRegistry } from './component-registry';
import { EntityRegistry } from './entity-registry';
import { Pipeline } from '../../public/pipeline';

/**
 * @internal
 */
export class ThemisPipeline<T> implements Pipeline<T> {
  private readonly id: string;
  private readonly systems: Array<System<T>>;
  private readonly updateCallbacks: Array<OnUpdate<T>>;
  private readonly entityRegistry: EntityRegistry;
  private readonly componentRegistry: ComponentRegistry;
  private readonly eventRegistry: EventRegistry;

  constructor(
    id: string,
    systems: Array<System<T>>,
    entityRegistry: EntityRegistry,
    componentRegistry: ComponentRegistry,
    eventRegistry: EventRegistry
  ) {
    this.id = id;
    this.systems = systems;
    this.entityRegistry = entityRegistry;
    this.componentRegistry = componentRegistry;
    this.eventRegistry = eventRegistry;
    this.updateCallbacks = this.systems.filter((system) => system.update) as Array<OnUpdate<unknown>>;
  }

  public getId(): string {
    return this.id;
  }

  public getSystems(): Array<System<T>> {
    return this.systems;
  }

  public update(o: T): void {
    this.entityRegistry.update();
    this.componentRegistry.update();
    this.updateCallbacks.forEach((system) => system.update(o));
    this.eventRegistry.update();
  }
}
