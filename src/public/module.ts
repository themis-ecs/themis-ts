import { Class } from './decorator';
import { OnInit } from './lifecycle';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EmptyModule {}

export type ThemisModule = Required<EmptyModule> & Partial<OnInit>;

export type ModuleClass = Class<ThemisModule>;
