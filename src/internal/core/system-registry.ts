import { ThemisPipeline } from './pipeline';
import { ThemisWorld } from './world';

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
      });
    });
    this.pipelines.forEach((pipeline) => {
      pipeline.getSystems().forEach((system) => {
        system.init(world);
      });
    });
  }
}
