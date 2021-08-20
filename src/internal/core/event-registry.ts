import { Event, EventListener, EventType } from '../../public/event';

/**
 * @internal
 */
export class EventRegistry {
  private readonly eventListenerMap: Map<EventType<any>, EventListener<any>[]>;
  private readonly queuedEvents: Array<{ eventType: EventType<any>; event: Event }>;

  constructor() {
    this.eventListenerMap = new Map<EventType<any>, EventListener<any>[]>();
    this.queuedEvents = [];
  }

  public update(): void {
    while (this.queuedEvents.length > 0) {
      const pop = this.queuedEvents.pop()!;
      this.notifyListeners(pop.eventType, pop.event);
    }
  }

  public registerListener<T extends Event>(eventType: EventType<T>, listener: EventListener<T>): void {
    let eventListener = this.eventListenerMap.get(eventType);
    if (eventListener === undefined) {
      eventListener = [];
      this.eventListenerMap.set(eventType, eventListener);
    }
    eventListener.push(listener);
  }

  public submit<T extends Event>(eventType: EventType<T>, event: T, instant = false): void {
    if (instant) {
      this.notifyListeners(eventType, event);
    } else {
      this.queuedEvents.push({ eventType, event });
    }
  }

  private notifyListeners(eventType: EventType<any>, event: Event): void {
    this.eventListenerMap.get(eventType)?.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error(error); // TODO listeners should have an error callback
      }
    });
  }
}
