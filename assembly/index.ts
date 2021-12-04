/// <reference path="../node_modules/assemblyscript/std/assembly/rt/index.d.ts" />

const MIN_BUFFER_LEN = isDefined(MIN_AS_SINK_BUFFER_LENGTH) ? MIN_AS_SINK_BUFFER_LENGTH : 32;

// @ts-ignore: decorator
@inline function nextPowerOf2(n: u32): u32 {
  return 1 << 32 - clz(n - 1);
}

export class ByteSink {
  protected buffer: ArrayBuffer;
  protected offset: u32 = 0;

  static withCapacity(capacity: i32): ByteSink {
    return new ByteSink([], capacity);
  }

  constructor(initial: StaticArray<u8> = [], capacity: i32 = MIN_BUFFER_LEN) {
    var size = <usize>initial.length;
    this.buffer = changetype<ArrayBuffer>(__new(
      max<usize>(size, max<usize>(MIN_BUFFER_LEN, <usize>capacity)),
      idof<ArrayBuffer>())
    );
    if (size) {
      memory.copy(
        changetype<usize>(this.buffer),
        changetype<usize>(initial),
        size
      );
      this.offset += size;
    }
  }

  get length(): i32 {
    return this.offset;
  }

  get capacity(): i32 {
    return this.buffer.byteLength;
  }

  write(src: StaticArray<u8>, start: i32 = 0, end: i32 = i32.MAX_VALUE): void {
    let len = src.length as u32;

    if (start != 0 || end != i32.MAX_VALUE) {
      let from: i32;
      from  = min<i32>(max(start, 0), len);
      end   = min<i32>(max(end,   0), len);
      start = min<i32>(from, end);
      end   = max<i32>(from, end);
      len   = end - start;
    }

    if (!len) return;

    let size = len;
    this.ensureCapacity(size);
    let offset = this.offset;

    memory.copy(
      changetype<usize>(this.buffer) + offset,
      changetype<usize>(src) + <usize>start,
      size
    );
    this.offset = offset + size;
  }

  writeNumber<T extends number>(value: T): void {
    let offset = this.offset;
    if (isInteger<T>()) {
      let maxCapacity = 0;
      // this also include size for sign
      if (sizeof<T>() == 1) {
        maxCapacity = 4;
      } else if (sizeof<T>() == 2) {
        maxCapacity = 6;
      } else if (sizeof<T>() == 4) {
        maxCapacity = 11;
      } else if (sizeof<T>() == 8) {
        maxCapacity = 21;
      }
      this.ensureCapacity(maxCapacity);
    } else {
      this.ensureCapacity(32);
    }
    store<T>(changetype<usize>(this.buffer) + offset, value);
    this.offset = offset;
  }

  reserve(capacity: i32, clear: bool = false): void {
    if (clear) this.offset = 0;
    this.buffer = changetype<ArrayBuffer>(__renew(
      changetype<usize>(this.buffer),
      max<usize>(this.offset, max<usize>(MIN_BUFFER_LEN, <usize>capacity))
    ));
  }

  shrink(): void {
    this.buffer = changetype<ArrayBuffer>(__renew(
      changetype<usize>(this.buffer),
      max<u32>(this.offset, MIN_BUFFER_LEN)
    ));
  }

  clear(): void {
    this.reserve(0, true);
  }

  toStringUTF8(): string {
    let size = this.offset;
    if (!size) return "";
    return String.UTF8.decodeUnsafe(changetype<usize>(this.buffer), <usize>size);
  }

  toStringUTF16(): string {
    let size = this.offset;
    if (!size) return "";
    return String.UTF16.decodeUnsafe(changetype<usize>(this.buffer), <usize>size);
  }

  toStaticArray(): StaticArray<u8> {
    let size = this.offset;
    if (!size) return [];
    let buffer = new StaticArray<u8>(size);
    memory.copy(changetype<usize>(buffer), changetype<usize>(this.buffer), <usize>size);
    return buffer;
  }

  toBuffer(): ArrayBuffer {
    let size = this.offset;
    if (!size) return new ArrayBuffer(0);
    return this.buffer.slice(0, <i32>size);
  }

  @inline protected ensureCapacity(deltaBytes: u32): void {
    let buffer  = this.buffer;
    let newSize = this.offset + deltaBytes;
    if (newSize > <u32>buffer.byteLength) {
      this.buffer = changetype<ArrayBuffer>(__renew(
        changetype<usize>(buffer),
        nextPowerOf2(newSize)
      ));
    }
  }
}
