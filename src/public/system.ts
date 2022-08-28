import { OnInit, OnUpdate } from './lifecycle';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EmtpySystem {}

export type SystemType<T = number> = Required<EmtpySystem> & Partial<OnUpdate<T> & OnInit>;
