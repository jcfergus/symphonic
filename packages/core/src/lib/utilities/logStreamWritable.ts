import { Writable, WritableOptions } from 'stream';
import { performance } from 'perf_hooks';
import debug from 'debug';
import Denque from 'denque';

const dbg = debug('symphonic:core:utilities:log-stream');

/**
 * Custom config object that implements sane defaults and adds line buffers.
 */
export interface LogStreamConfig extends WritableOptions {
  bufferLines?: number;
}

/**
 * Implements a Writeable that can be read by a symphonic UI to display logs.
 */
export interface LogEntry {
  // Timestamp as Date().time() for smallest storage.
  timestamp: number;
  line: string;
}

export class LogStreamWritable extends Writable {
  private _lines: Denque<LogEntry>;
  private _startTime: number;
  private _timeOffset: number;
  private _config: LogStreamConfig;

  constructor(config: LogStreamConfig) {
    if (!config.bufferLines) {
      config.bufferLines = 1500;
    }
    // We're assuming an average of 80 column line lengths; this should be safe enough.
    // If necessary we can add code to increase it if we bump against it and still have
    // empty lines.
    config.highWaterMark = config.bufferLines * 80;
    super(config);
    this._config = config;
    this._lines = new Denque<LogEntry>();

    // Actual log event timestamp can be calculated using:
    // this.startTime + (eventTimestamp - this.timeOffset)
    this._startTime = new Date().getTime();
    this._timeOffset = performance.now();
  }

  get length() {
    return this._lines.length;
  }

  public _write(
    chunk: any,
    encoding: BufferEncoding,
    callback: (error?: Error | null) => void
  ) {
    this.emit('write', chunk);

    chunk
      .toString()
      .split(/\r*[\r\n]/)
      .forEach((line: string, index: number, arr: Array<string>) => {
        // Remove empty strings resulting from newlines at end of chunk.
        if (!(line === '' && index === (arr.length - 1 ))) {
          this.emit('line', line);
          this._lines.push({ timestamp: performance.now(), line });
          if (this._lines.length > this._config.bufferLines) {
            dbg(
              `Dropping oldest log entries because entries.length > ${this._config.bufferLines}`
            );
            this._lines.shift();
          }
        }
      });

    callback();
  }

  public _final(callback: (error?: Error | null) => void) {
    this.emit('final');
    callback();
  }
}
