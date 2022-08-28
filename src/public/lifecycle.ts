export interface OnInit {
  init(): void;
}

export interface OnUpdate<T = number> {
  update(o: T): void;
}
