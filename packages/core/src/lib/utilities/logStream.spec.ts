import { LogStreamWritable } from "./logStreamWritable";
import debug from 'debug';

const dbg = debug("symphonic:test:core:utilities:log-stream");

describe("logStream", () => {
  it("correctly instantiates", () => {
    const testStream = new LogStreamWritable({});
    expect(testStream instanceof LogStreamWritable).toBeTruthy();
  })

  it("emits a write event when written to", (done) => {
    const testStream = new LogStreamWritable({});
    let writeCount = 0;
    let finalCount = 0;

    testStream.on("write", () => {
      writeCount += 1;
    });
    testStream.on("final", () => {
      finalCount += 1;
    })
    testStream.write("Foo");
    testStream.end(() => {

      testStream.destroy();

      expect(writeCount).toBe(1);
      expect(finalCount).toBe(1);

      expect(testStream.length).toBe(1);

      done();
    });
  });

  it("correctly breaks log lines at newlines", (done) => {
    const testStream = new LogStreamWritable({});

    let lineCounter = 0;

    testStream.on('line', () => {
      lineCounter++;
    })

    for ( let i = 0; i < 100; i++ ) {
      testStream.write("Sample Log\nSampleLog\nSmpleOg\n");
    }

    testStream.end(() => {
      testStream.destroy();

      expect(testStream.length).toBe(300);
      expect(lineCounter).toBe(300);

      done();
    })
  });

  it("correctly drops entries if line buffer is filled", (done) => {
    const testStream = new LogStreamWritable({bufferLines: 500});

    let lineCounter = 0;

    testStream.on('line', () => {
      lineCounter++;
    })

    for ( let i = 0; i < 200; i++ ) {
      testStream.write("Sample Log\nSampleLog\nSmpleOg\n");
    }

    testStream.end(() => {
      testStream.destroy();

      // Buffer only holds 500 lines.
      expect(testStream.length).toBe(500);

      // Buffer should have received 600 lines.
      expect(lineCounter).toBe(600);

      done();
    })
  })
})
