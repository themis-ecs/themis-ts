/**
 * Fast implementation of a vector that holds bits
 * @internal
 */
export class BitVector {
  private chunks: Uint32Array;

  /**
   * Create a new BitVector with initial capacity of 1024
   * @param {number} size the initial size of the BitVector
   */
  constructor(size: number = 1024) {
    this.chunks = new Uint32Array((size / 32) >> 0);
  }

  /**
   * Set the bit at the given position
   * @param {number} position
   */
  public set(position: number): void {
    const chunk = (position / 32) >> 0;
    this.ensureCapacity(chunk + 1);
    const pos = position - chunk * 32;
    this.chunks[chunk] |= 1 << pos;
  }

  /**
   * Get the bit at the given position
   * @param {number} position
   * @return {boolean} whether the bit is set or not
   */
  public get(position: number): boolean {
    const chunk = (position / 32) >> 0;
    this.ensureCapacity(chunk + 1);
    const pos = position - chunk * 32;
    return (this.chunks[chunk] & (1 << pos)) !== 0;
  }

  /**
   * Clear the bit at the given position
   * @param {number} position
   */
  public clear(position: number): void {
    const chunk = (position / 32) >> 0;
    this.ensureCapacity(chunk + 1);
    const pos = position - chunk * 32;
    this.chunks[chunk] &= ~(1 << pos);
  }

  /**
   * Unset all bits
   */
  public reset(): void {
    this.chunks = new Uint32Array(this.chunks.length);
  }

  /**
   * Get an array of all positions which are set
   * @return {Array<number>}
   */
  public getBits(): number[] {
    let count = 0;
    for (let i = 0; i < this.chunks.length; i++) {
      count += BitVector.bitCount(this.chunks[i]);
    }
    const result = new Array<number>(count);
    for (let i = 0, idx = 0; idx < count; i++) {
      let chunk = this.chunks[i];
      const offset = i << 5;
      while (chunk !== 0) {
        result[idx++] = BitVector.numberOfTrailingZeros(chunk) + offset;
        chunk &= chunk - 1;
      }
    }

    return result;
  }

  /**
   * Compares this BitVector with another one
   * @param {BitVector} other
   * @return {boolean} whether the compared instances are the same or not
   */
  public equals(other: BitVector): boolean {
    if (!other) {
      return false;
    }
    if (other.chunks.length !== this.chunks.length) {
      return false;
    }
    for (let i = 0; i < this.chunks.length; i++) {
      if (other.chunks[i] !== this.chunks[i]) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check if this BitVector has all the bits set that are also set in the
   * given other BitVector (Bitmask check)
   * @param {BitVector} other
   * @return {boolean} true, if the given mask applies to this BitVector
   */
  public containsAll(other: BitVector): boolean {
    for (let i = 0; i < Math.min(this.chunks.length, other.chunks.length); i++) {
      if ((this.chunks[i] & other.chunks[i]) !== other.chunks[i]) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check if this BitVector has any bit set that is also set in the given
   * BitVector
   * @param {BitVector} other
   * @return {boolean} true if at least one bit at the same position is set
   * in this and the other BitVector, false otherwise.
   */
  public containsAny(other: BitVector): boolean {
    for (let i = 0; i < this.chunks.length; i++) {
      if ((this.chunks[i] & other.chunks[i]) !== 0) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if this BitVector has no bits set that is set in the given other
   * BitVector
   * @param {BitVector} other
   * @return {boolean} true if this BitVector has no bit set that is set in
   * the other BitVector, false otherwise
   */
  public containsNone(other: BitVector): boolean {
    for (let i = 0; i < this.chunks.length; i++) {
      if ((this.chunks[i] & other.chunks[i]) !== 0) {
        return false;
      }
    }
    return true;
  }

  /**
   * get the current capacity of this BitVector. This will always be a power of 2.
   * @return {number} capacity
   */
  public getCapacity(): number {
    return this.chunks.length * 32;
  }

  /**
   * Set the maximum number of bits this vector can hold. If this is not a power of 2,
   * the capacity will be set to the next larger power of 2.
   * @param {number} capacity
   */
  public setCapacity(capacity: number) {
    this.ensureCapacity(capacity);
  }

  /**
   * get the number of bits in the integer representation of this number that
   * are set to 1
   * @param {number} n the number
   * @return {number}
   * @private
   */
  private static bitCount(n: number): number {
    n = n - ((n >> 1) & 0x55555555);
    n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
    return (((n + (n >> 4)) & 0xf0f0f0f) * 0x1010101) >> 24;
  }

  /**
   * returns the number of zero bits following the lowest-order ("rightmost")
   * one-bit in the two's complement binary representation of the specified long
   * value. It returns 32 if the specified value has no one-bits in its two's
   * complement representation, in other words if it is equal to zero.
   * @param {number} i - should be a 32 bit integer
   * @return {number}
   * @private
   */
  private static numberOfTrailingZeros(i: number): number {
    let y: number;
    if (i === 0) return 32;
    let n = 31;
    y = i << 16;
    if (y !== 0) {
      n = n - 16;
      i = y;
    }
    y = i << 8;
    if (y !== 0) {
      n = n - 8;
      i = y;
    }
    y = i << 4;
    if (y !== 0) {
      n = n - 4;
      i = y;
    }
    y = i << 2;
    if (y !== 0) {
      n = n - 2;
      i = y;
    }
    return n - ((i << 1) >>> 31);
  }

  /**
   * ensures, that this vector can hold the given number of bits. The capactiy is always a
   * power of 2.
   * @param {number} capacity
   * @private
   */
  private ensureCapacity(capacity: number): void {
    if (this.chunks.length >= capacity) {
      return;
    }
    const newChunks = new Uint32Array(Math.pow(2, (Math.log2(capacity) >> 0) + 1));
    newChunks.set(this.chunks, 0);
    this.chunks = newChunks;
  }

  /**
   * Convenience method to create a new BitVector. The given numbers are the
   * positions which are initially set.
   * @param {...values} values
   * @return {BitVector}
   */
  static from(...values: number[]): BitVector {
    const bitVector = new BitVector();
    for (const value of values) {
      bitVector.set(value);
    }
    return bitVector;
  }
}
