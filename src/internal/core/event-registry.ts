import { Event, EventErrorCallback, EventListener, EventType } from '../../public/event';
import { Logging } from '../../public/logger';

const logger = Logging.getLogger('themis.event');

type EventListenerEntry<T> = {
  listener: EventListener<T>;
  errorCallback?: EventErrorCallback<T>;
};

/**
 * @internal
 */
export class EventRegistry {
  private readonly eventListenerMap: Map<EventType<any>, EventListenerEntry<any>[]>;
  private readonly queuedEvents: Array<{ eventType: EventType<any>; event: Event }>;

  constructor() {
    this.eventListenerMap = new Map<EventType<any>, EventListenerEntry<any>[]>();
    this.queuedEvents = [];
  }

  public update(): void {
    while (this.queuedEvents.length > 0) {
      const pop = this.queuedEvents.pop()!;
      this.notifyListeners(pop.eventType, pop.event);
    }
  }

  public registerListener<T extends Event>(
    eventType: EventType<T>,
    listener: EventListener<T>,
    errorCallback?: EventErrorCallback<T>
  ): void {
    let eventListener = this.eventListenerMap.get(eventType);
    if (eventListener === undefined) {
      eventListener = [];
      this.eventListenerMap.set(eventType, eventListener);
    }
    const entry: EventListenerEntry<T> = {
      listener,
      errorCallback
    };
    eventListener.push(entry);
  }

  public submit<T extends Event>(eventType: EventType<T>, event: T, instant = false): void {
    if (instant) {
      this.notifyListeners(eventType, event);
    } else {
      this.queuedEvents.push({ eventType, event });
    }
  }

  private notifyListeners(eventType: EventType<any>, event: Event): void {
    this.eventListenerMap.get(eventType)?.forEach((entry) => {
      try {
        entry.listener(event);
      } catch (error) {
        if (entry.errorCallback) {
          entry.errorCallback(event, error);
        } else {
          logger.error(error);
        }
      }
    });
  }
}
