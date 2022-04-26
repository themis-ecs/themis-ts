import { EventRegistry } from '../src/internal/core/event-registry';

test('Event Test', () => {
  const eventRegistry = new EventRegistry();
  let a = false;
  let b = false;
  eventRegistry.registerListener(EventTestA, (event) => {
    expect(event.a).toEqual('blub');
    a = true;
  });
  eventRegistry.registerListener(EventTestB, (event) => {
    expect(event.b).toEqual(5);
    b = true;
  });
  eventRegistry.submit(EventTestA, { a: 'blub' });
  eventRegistry.submit(EventTestB, { b: 5 });
  eventRegistry.submit(EventTestC, { c: true });

  eventRegistry.update();

  expect(a).toEqual(true);
  expect(b).toEqual(true);
});

test('Listener Throws Error', () => {
  const eventRegistry = new EventRegistry();

  let errorHandled = false;

  eventRegistry.registerListener(
    EventTestA,
    () => {
      throw new Error('test');
    },
    (event, error) => {
      errorHandled = true;
      expect((error as Error).message).toEqual('test');
    }
  );

  eventRegistry.submit(EventTestA, { a: 'blub' }, true);

  expect(errorHandled).toBe(true);
});

test('Listener Unsubscription', () => {
  const eventRegistry = new EventRegistry();
  let counter = 0;
  const subscription = eventRegistry.registerListener(EventTestB, (event) => {
    counter = counter + event.b;
  });

  eventRegistry.submit(EventTestB, { b: 5 }, true);
  expect(counter).toEqual(5);
  eventRegistry.submit(EventTestB, { b: 7 }, true);
  expect(counter).toEqual(12);

  subscription.unsubscribe();
  eventRegistry.submit(EventTestB, { b: 3 }, true);
  expect(counter).toEqual(12);
});

class EventTestA {
  a!: string;
}

class EventTestB {
  b!: number;
}

class EventTestC {
  c!: boolean;
}
