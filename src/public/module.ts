import { Pipeline } from './pipeline';

export abstract class TopModule<T = number> {
  public abstract init?(pipeline: Pipeline<T>): void;
}

export abstract class SubModule {
  public abstract init?(): void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EmptyModule {}

export type ThemisModule<U> = Required<EmptyModule> & Partial<TopModule<U> | SubModule>;
