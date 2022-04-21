export interface OnInit {
  init(): void;
}

export interface OnUpdate<T = number> {
  update(o: T): void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EmtpySystem {}

export type SystemType<T = number> = Required<EmtpySystem> & Partial<OnUpdate<T> & OnInit>;
