import { Class, Identifier } from './decorator';

export type Provider<T = unknown> = () => T;
export type FactoryProvider<T = unknown> = Provider<T>;
export type ValueProvider<T = unknown> = T;
export type ClassProvider<T = unknown> = Class<T>;

export type ProviderDefinition<T = unknown> = {
  provide: Identifier<T>;
  useClass?: ClassProvider<T>;
  useValue?: ValueProvider<T>;
  useFactory?: FactoryProvider<T>;
};
