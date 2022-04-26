import { Event, EventErrorCallback, EventListener, EventType, Subscription } from '../../public/event';
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
  private readonly eventListenerMap: Map<EventType<Event>, Map<symbol, EventListenerEntry<Event>>>;
  private readonly queuedEvents: Array<{ eventType: EventType<Event>; event: Event }>;

  constructor() {
    this.eventListenerMap = new Map<EventType<Event>, Map<symbol, EventListenerEntry<Event>>>();
    this.queuedEvents = [];
  }

  public update(): void {
    let pop = this.queuedEvents.pop();
    while (pop !== undefined) {
      this.notifyListeners(pop.eventType, pop.event);
      pop = this.queuedEvents.pop();
    }
  }

  public registerListener<T extends Event>(
    eventType: EventType<T>,
    listener: EventListener<T>,
    errorCallback?: EventErrorCallback<T>
  ): Subscription {
    let eventListener = this.eventListenerMap.get(eventType);
    if (eventListener === undefined) {
      eventListener = new Map<symbol, EventListenerEntry<Event>>();
      this.eventListenerMap.set(eventType, eventListener);
    }
    const id = Symbol();
    const entry: EventListenerEntry<T> = {
      listener,
      errorCallback
    };
    eventListener.set(id, entry as EventListenerEntry<Event>);

    return {
      unsubscribe() {
        if (eventListener) {
          eventListener.delete(id);
        }
      }
    };
  }

  public submit<T extends Event>(eventType: EventType<T>, event: T, instant = false): void {
    if (instant) {
      this.notifyListeners(eventType, event);
    } else {
      this.queuedEvents.push({ eventType, event });
    }
  }

  private notifyListeners(eventType: EventType<Event>, event: Event): void {
    const eventListeners = this.eventListenerMap.get(eventType);
    if (eventListeners) {
      eventListeners.forEach((entry) => {
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
}
