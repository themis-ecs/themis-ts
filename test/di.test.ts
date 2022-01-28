import 'reflect-metadata';
import { Container } from '../src/internal/di/container';
import { Injectable, REQUEST, SINGLETON } from '../src';

test('Test Singleton Scope', () => {
  const container = new Container();
  const instance = container.resolve(TestClassSingleton);
  instance.input.a = 'b';
  const instance2 = container.resolve(TestClassSingleton);
  expect(instance2.input.a).toEqual('b');
});

test('Test Request Scope', () => {
  const container = new Container();
  const instance = container.resolve(TestClassRequest);
  instance.input.a = 'b';
  const instance2 = container.resolve(TestClassRequest);
  expect(instance2.input.a).toEqual('a');
});

class TestClass2 {
  a: string = 'a';
}

@Injectable({ scope: SINGLETON })
class TestClassSingleton {
  constructor(public input: TestClass2) {}
}

@Injectable({ scope: REQUEST })
class TestClassRequest {
  constructor(public input: TestClass2) {}
}
