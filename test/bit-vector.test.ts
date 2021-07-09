import { BitVector } from '../src/internal/bit-vector';

test('set and get', () => {
  const vec = new BitVector();
  vec.set(5);
  expect(vec.get(5)).toBe(true);
});

test('set and clear', () => {
  const vec = new BitVector();
  expect(vec.get(5)).toBe(false);
  vec.set(5);
  expect(vec.get(5)).toBe(true);
  vec.clear(5);
  expect(vec.get(5)).toBe(false);
});

test('dynamic resize', () => {
  const vec = new BitVector();
  vec.set(32 * 32 - 1);
  expect(vec.getCapacity()).toBe(1024);
  vec.set(32 * 32);
  expect(vec.getCapacity()).toBe(2048);
  vec.set(128 * 32);
  expect(vec.getCapacity()).toBe(128 * 32 * 2);
});

test('equals', () => {
  const vec = BitVector.from(1, 2, 3, 4, 5);
  const other = BitVector.from(1, 2, 3, 4, 5);
  const other2 = BitVector.from(1, 2, 3, 4);
  const other3 = BitVector.from(1, 2, 3, 4, 5, 6);
  expect(vec.equals(other)).toBe(true);
  expect(vec.equals(other2)).toBe(false);
  expect(vec.equals(other3)).toBe(false);
});

test('containsAll', () => {
  const vec = BitVector.from(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
  const other = BitVector.from(1, 2, 3);
  const other2 = BitVector.from(1, 2, 3, 11);
  expect(vec.containsAll(other)).toBe(true);
  expect(vec.containsAll(other2)).toBe(false);
});

test('containsAll different vector sizes', () => {
  const vec = BitVector.from(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
  vec.setCapacity(4 * 1024);
  const other = BitVector.from(1, 2, 3);
  const other2 = BitVector.from(1, 2, 3, 11);
  expect(vec.containsAll(other)).toBe(true);
  expect(vec.getCapacity()).not.toBe(other.getCapacity());
  other.setCapacity(8 * 1024);
  expect(vec.containsAll(other)).toBe(true);
  expect(vec.getCapacity()).not.toBe(other.getCapacity());
  expect(vec.containsAll(other2)).toBe(false);
  expect(vec.getCapacity()).not.toBe(other2.getCapacity());
  other2.setCapacity(8 * 1024);
  expect(vec.containsAll(other2)).toBe(false);
  expect(vec.getCapacity()).not.toBe(other2.getCapacity());
});

test('containsAny', () => {
  const vec = BitVector.from(1, 2, 3, 4, 5);
  vec.setCapacity(4 * 1024);
  const other = BitVector.from(1, 2, 3, 8, 9, 10);
  const other2 = BitVector.from(6, 7, 8);
  expect(vec.containsAny(other)).toBe(true);
  expect(vec.containsAny(other2)).toBe(false);
});

test('containsAny different vector sizes', () => {
  const vec = BitVector.from(1, 2, 3, 4, 5);
  vec.setCapacity(4 * 1024);
  const other = BitVector.from(1, 2, 3, 8, 9, 10);
  const other2 = BitVector.from(6, 7, 8);
  expect(vec.containsAny(other)).toBe(true);
  expect(vec.getCapacity()).not.toBe(other.getCapacity());
  other.setCapacity(8 * 1024);
  expect(vec.containsAny(other)).toBe(true);
  expect(vec.getCapacity()).not.toBe(other.getCapacity());
  expect(vec.containsAny(other2)).toBe(false);
  expect(vec.getCapacity()).not.toBe(other2.getCapacity());
  other2.setCapacity(8 * 1024);
  expect(vec.containsAny(other2)).toBe(false);
  expect(vec.getCapacity()).not.toBe(other2.getCapacity());
});

test('containsNone', () => {
  const vec = BitVector.from(1, 2, 3, 4, 5);
  const other = BitVector.from(6, 7, 8, 9, 10);
  const other2 = BitVector.from(5, 6, 7, 8, 9, 10);
  expect(vec.containsNone(other)).toBe(true);
  expect(vec.containsNone(other2)).toBe(false);
});

test('containsNone different vector sizes', () => {
  const vec = BitVector.from(1, 2, 3, 4, 5);
  vec.setCapacity(4 * 1024);
  const other = BitVector.from(6, 7, 8, 9, 10);
  const other2 = BitVector.from(5, 6, 7, 8, 9, 10);
  expect(vec.containsNone(other)).toBe(true);
  expect(vec.getCapacity()).not.toBe(other.getCapacity());
  other.setCapacity(8 * 1024);
  expect(vec.containsNone(other)).toBe(true);
  expect(vec.getCapacity()).not.toBe(other.getCapacity());
  expect(vec.containsNone(other2)).toBe(false);
  expect(vec.getCapacity()).not.toBe(other2.getCapacity());
  other2.setCapacity(8 * 1024);
  expect(vec.containsNone(other2)).toBe(false);
  expect(vec.getCapacity()).not.toBe(other2.getCapacity());
});

test('getBits', () => {
  const vec = BitVector.from(1, 2, 3, 4, 5, 20, 2048, 10000);
  expect(vec.getBits()).toStrictEqual([1, 2, 3, 4, 5, 20, 2048, 10000]);
});
