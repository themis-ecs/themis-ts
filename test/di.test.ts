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

test('Test Complex Dependency', () => {
  const container = new Container();
  const dep4 = container.resolve(TestClassComplex4);
  expect(dep4.id).toEqual('4');
  expect(dep4.dep1.id).toEqual('1');
  expect(dep4.dep2.id).toEqual('2');
  expect(dep4.dep2.dep1.id).toEqual('1');
  expect(dep4.dep3.id).toEqual('3');
  expect(dep4.dep3.dep2.id).toEqual('2');
  expect(dep4.dep3.dep2.dep1.id).toEqual('1');
  expect(dep4.dep3.dep1.id).toEqual('1');
});

test('Test Circular Dependency', () => {
  const container = new Container();
  expect(() => container.resolve(TestClassCircular)).toThrowError();
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

@Injectable()
class TestClassComplex1 {
  public id = '1';
  constructor() {}
}

@Injectable()
class TestClassComplex2 {
  public id = '2';
  constructor(public dep1: TestClassComplex1) {}
}

@Injectable()
class TestClassComplex3 {
  public id = '3';
  constructor(public dep1: TestClassComplex1, public dep2: TestClassComplex2) {}
}

@Injectable()
class TestClassComplex4 {
  public id = '4';
  constructor(public dep1: TestClassComplex1, public dep2: TestClassComplex2, public dep3: TestClassComplex3) {}
}

@Injectable()
class TestClassCircular {
  constructor(public dep: TestClassCircular) {}
}
