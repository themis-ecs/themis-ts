import { EventRegistry } from '../src/internal/event-registry';

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

class EventTestA {
  a!: string;
}

class EventTestB {
  b!: number;
}

class EventTestC {
  c!: boolean;
}
