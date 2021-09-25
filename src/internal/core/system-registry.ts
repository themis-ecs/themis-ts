import { ThemisPipeline } from './pipeline';
import { ThemisWorld } from './world';
import { System } from '../../public/system';
import { Prototype } from './prototype';
import { ComponentSetBuilder } from './component-set-builder';
import { EntityCollection } from '../../public/entity-collection';

/**
 * @internal
 */
export class SystemRegistry {
  private readonly pipelines: Map<string, ThemisPipeline<unknown>>;

  constructor(pipelines: Array<ThemisPipeline<unknown>>) {
    this.pipelines = new Map<string, ThemisPipeline<unknown>>();
    pipelines.forEach((pipeline) => this.pipelines.set(pipeline.getId(), pipeline));
  }

  public initSystems(world: ThemisWorld): void {
    this.pipelines.forEach((pipeline) => {
      pipeline.getSystems().forEach((system) => {
        world.inject(system);
        this.injectComponentSets(world, system);
        system.init(world);
      });
    });
  }

  private injectComponentSets(world: ThemisWorld, system: System<unknown>) {
    const metadata = Prototype.getMetadata(Object.getPrototypeOf(system));
    const componentSetMetadata = metadata.componentSetMetadata;
    if (!componentSetMetadata) {
      return;
    }
    Object.keys(componentSetMetadata).forEach((key: string) => {
      const queryFunctions = componentSetMetadata[key];

      const componentSetBuilder = new ComponentSetBuilder();
      queryFunctions.forEach((fn) => fn(componentSetBuilder));

      const componentSet = world.getComponentRegistry().createComponentSet(componentSetBuilder);
      const entityCollection = new EntityCollection(componentSet, world);

      Object.defineProperty(system, key, {
        value: entityCollection
      });
    });
  }
}
