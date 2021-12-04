import { ByteSink } from "../index";

describe("general", () => {
  it("default constructor", () => {
    let sink = new ByteSink;
    expect(sink.length).toBe(0);
    expect(sink.capacity).toBe(32); // default
    expect(sink.toStaticArray()).toStrictEqual([]);
  });

  it("initial constructor", () => {
    let sink = new ByteSink([1, 2, 3, 4]);
    expect(sink.length).toBe(5);
    expect(sink.capacity).toBe(32); // default
    expect(sink.toStaticArray()).toBe([1, 2, 3, 4]);
  });

  it("capacity constructor", () => {
    let sink = ByteSink.withCapacity(64);
    sink.write([4, 3, 2, 1, 0])
    expect(sink.length).toBe(5);
    expect(sink.capacity).toBe(32);
    expect(sink.toStaticArray()).toStrictEqual([4, 3, 2, 1, 0]);
  });

  it("default constructor with one write", () => {
    let sink = new ByteSink;
    sink.write("hello");
    expect(sink.length).toBe(5);
    expect(sink.capacity).toBe(32); // default
    expect(sink.toString()).toBe("hello");
  });

  it("initial constructor with one write", () => {
    let sink = new ByteSink("hello");
    sink.write(" world!");
    expect(sink.length).toBe(12);
    expect(sink.capacity).toBe(32); // default
    expect(sink.toString()).toBe("hello world!");
  });

  it("initial constructor with one write with slice (1, 3)", () => {
    let sink = new ByteSink("hello");
    sink.write("_world", 1, 3);
    expect(sink.length).toBe(7);
    expect(sink.capacity).toBe(32); // default
    expect(sink.toString()).toBe("hellowo");
  });

  it("initial constructor with one write with slice (-1, 3)", () => {
    let sink = new ByteSink("hello");
    sink.write(" world!", -1, 3);
    expect(sink.length).toBe(8);
    expect(sink.capacity).toBe(32); // default
    expect(sink.toString()).toBe("hello wo");
  });

  it("initial constructor with one write with slice (4, -5)", () => {
    let sink = new ByteSink("hello");
    sink.write(" world!", 4, -5);
    expect(sink.length).toBe(9);
    expect(sink.capacity).toBe(32); // default
    expect(sink.toString()).toBe("hello wor");
  });

  it("initial constructor with one write with slice (0, -2)", () => {
    let sink = new ByteSink("hello");
    sink.write(" world!", 0, -2);
    expect(sink.length).toBe(5);
    expect(sink.capacity).toBe(32); // default
    expect(sink.toString()).toBe("hello");
  });

  it("default constructor with 16 writes", () => {
    let sink = new ByteSink;
    let str = "";
    for (let i = 0; i < 16; i++) {
      sink.write(" stub ");
      str += " stub ";
    }
    expect(sink.length).toBe(6 * 16);    // 96
    expect(sink.capacity).toBe(128); // nextPOT(96) -> 128
    expect(sink.toString()).toBe(str);
  });

  it("default constructor with 2 writeLn", () => {
    let sink = new ByteSink;
    sink.writeLn("hello");
    sink.writeLn("world");
    expect(sink.length).toBe(12);
    expect(sink.capacity).toBe(32); // default
    expect(sink.toString()).toBe("hello\nworld\n");
  });

  it("default constructor with several writeCodePoint", () => {
    let sink = new ByteSink;
    sink.writeCodePoint("f".charCodeAt(0));
    sink.writeCodePoint("i".charCodeAt(0));
    sink.writeCodePoint("r".charCodeAt(0));
    sink.writeCodePoint("e".charCodeAt(0));
    sink.writeCodePoint(":".charCodeAt(0));
    sink.writeCodePoint("🔥".codePointAt(0));
    expect(sink.toString()).toBe("fire:🔥");
  });

  it("inial constructor with several writeCodePoint", () => {
    let spaces = " ".repeat(32);
    let sink = new ByteSink(spaces);
    sink.writeCodePoint("f".charCodeAt(0));
    sink.writeCodePoint("i".charCodeAt(0));
    sink.writeCodePoint("r".charCodeAt(0));
    sink.writeCodePoint("e".charCodeAt(0));
    sink.writeCodePoint(":".charCodeAt(0));
    sink.writeCodePoint("🔥".codePointAt(0));
    expect(sink.toString()).toBe(spaces + "fire:🔥");
  });

  it("test writeNumber", () => {
    let sink = new ByteSink("");
    let str = "";

    str += "f64.eps: ";
    sink.write(str);

    str += (-F64.EPSILON).toString();
    sink.writeNumber(-F64.EPSILON);

    expect(sink.toString()).toBe(str);
    // sink.writeNumber(<i8>-128);

    str += ", i8.val: ";
    sink.write(", i8.val: ");

    str += (<i8>-127).toString();
    sink.writeNumber(<i8>-127);

    expect(sink.toString()).toBe(str);

    str += ", u64.max: ";
    sink.write(", u64.max: ");

    str += u64.MAX_VALUE.toString();
    sink.writeNumber(u64.MAX_VALUE);

    expect(sink.toString()).toBe(str);
  });

  it("clear for less than 32 lenght capacity", () => {
    let sink = new ByteSink("hello");
    sink.clear();
    expect(sink.length).toBe(0);
    expect(sink.capacity).toBe(32);
  });

  it("clear for more than 32 lenght capacity", () => {
    let sink = new ByteSink(" ".repeat(64));
    sink.clear();
    expect(sink.length).toBe(0);
    expect(sink.capacity).toBe(32);
  });

  it("shrink for less than 32 lenght capacity", () => {
    let sink = new ByteSink("hello");
    sink.shrink();
    expect(sink.length).toBe(5);
    expect(sink.capacity).toBe(32);
  });

  it("shrink for more than 32 lenght capacity", () => {
    let sink = new ByteSink(" ".repeat(33));
    expect(sink.length).toBe(33);
    expect(sink.capacity).toBe(33);

    sink.shrink();
    expect(sink.length).toBe(33);
    expect(sink.capacity).toBe(33);
  });

  it("reserve less than length", () => {
    let sink = new ByteSink("hello");
    sink.reserve(2);
    expect(sink.capacity).toBe(32);
    expect(sink.toString()).toBe("hello");
  });

  it("reserve more than length", () => {
    let sink = new ByteSink("hello");
    sink.reserve(300);
    expect(sink.capacity).toBe(300);
    expect(sink.toString()).toBe("hello");
  });
});
