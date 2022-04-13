import { Pipeline } from './pipeline';

export abstract class TopModule<T = number> {
  public abstract init?(pipeline: Pipeline<T>): void;
}

export abstract class SubModule {
  public abstract init?(): void;
}

export type ThemisModule<U> = TopModule<U> | SubModule;
