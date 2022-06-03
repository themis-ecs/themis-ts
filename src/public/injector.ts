import { Identifier } from './decorator';

export abstract class Injector {
  public abstract resolve<T>(identifier: Identifier<T>): T | undefined;
  public abstract inject(instance: unknown): void;
}
