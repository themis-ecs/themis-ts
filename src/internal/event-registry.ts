import { Event, EventListener, EventType } from '../public/event';

/**
 * @internal
 */
export class EventRegistry {
  private readonly eventListenerMap: Map<EventType<any>, EventListener<any>[]>;
  private queuedEvents: Array<{ eventType: EventType<any>; event: Event }>;

  constructor() {
    this.eventListenerMap = new Map<EventType<any>, EventListener<any>[]>();
    this.queuedEvents = [];
  }

  public update() {
    while (this.queuedEvents.length > 0) {
      const pop = this.queuedEvents.pop()!;
      this.eventListenerMap.get(pop.eventType)?.forEach((listener) => listener(pop.event));
    }
  }

  public registerListener<T extends Event>(eventType: EventType<T>, listener: EventListener<T>) {
    let eventListener = this.eventListenerMap.get(eventType);
    if (eventListener === undefined) {
      eventListener = [];
      this.eventListenerMap.set(eventType, eventListener);
    }
    eventListener.push(listener);
  }

  public submit<T extends Event>(eventType: EventType<T>, event: T) {
    this.queuedEvents.push({ eventType, event });
  }
}
