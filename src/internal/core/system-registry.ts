/**
 * @internal
 */
import { ThemisPipeline } from './pipeline';

export class SystemRegistry {
  private readonly pipelines: Map<string, ThemisPipeline>;

  constructor(pipelines: Array<ThemisPipeline>) {
    this.pipelines = new Map<string, ThemisPipeline>();
    pipelines.forEach((pipeline) => this.pipelines.set(pipeline.getId(), pipeline));
  }
}
