export class Event {}

export type EventType<T extends Event> = new () => T;

export type EventListener<T extends Event> = (event: T) => void;
