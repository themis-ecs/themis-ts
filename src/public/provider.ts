import { Class, Identifier } from './decorator';

export type Provider<T> = () => T;
export type FactoryProvider<T> = Provider<T>;
export type ValueProvider<T> = T;
export type ClassProvider<T> = Class<T>;

export type ProviderDefinition<T> = {
  provide: Identifier<T>;
  useClass?: ClassProvider<T>;
  useValue?: ValueProvider<T>;
  useFactory?: FactoryProvider<T>;
};
