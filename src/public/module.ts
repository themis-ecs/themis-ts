import { Pipeline } from './pipeline';

export abstract class ThemisModule<T = number> {
  public abstract init(pipeline: Pipeline<T>): void;
}
