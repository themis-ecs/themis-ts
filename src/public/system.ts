export interface OnInit {
  init(): void;
}

export interface OnUpdate<T = number> {
  update(o: T): void;
}

export type System<T = number> = Required<OnInit> & Partial<OnUpdate<T>>;
