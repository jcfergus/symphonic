import GeneralConfiguration from '../generalConfiguration';
import ResourceStatus, { ResourceState } from '../utilities/resourceStatus';
import ResourceConfiguration from '../resourceConfiguration';
import EventEmitter from 'events';
import { LogStreamWritable } from '../utilities/logStreamWritable';

export default abstract class BaseResource extends EventEmitter {
  /**
   * Static list of the events which can be emitted by this EventEmitter.
   */
  public static EVENTS = {
    stateChange: Symbol('stateChange'),
    created: Symbol('created'),
    starting: Symbol('starting'),
    started: Symbol('started'),
    stopping: Symbol('stopping'),
    stopped: Symbol('stopped'),
    destroying: Symbol('destroying'),
    destroyed: Symbol('destroyed'),
    error: Symbol('error'),
  };

  public static EVENT_DESCRIPTIONS = {
    [BaseResource.EVENTS.created]: 'CREATED',
    [BaseResource.EVENTS.starting]: 'STARTING',
    [BaseResource.EVENTS.started]: 'STARTED',
    [BaseResource.EVENTS.stopping]: 'STOPPING',
    [BaseResource.EVENTS.stopped]: 'STOPPED',
    [BaseResource.EVENTS.destroying]: 'DESTROYING',
    [BaseResource.EVENTS.destroyed]: 'DESTROYED',
    [BaseResource.EVENTS.error]: 'ERROR',
  };

  public name: string;
  public description?: string;
  public prettifier?: string;
  public needs?: Array<string>;

  public dependencies: Array<ResourceConfiguration> = [];

  public generalConfiguration!: GeneralConfiguration;

  public _error?: Error | undefined = undefined;
  public mostRecentStateChange?: symbol;
  public previousState?: ResourceState = ResourceState.NEW;
  public stdout?: LogStreamWritable;
  public stderr?: LogStreamWritable;

  /**
   * Inspired from the Node.js Readable & Writeable APIs, this lets us
   * implement the main functions of subclasses and not have to worry about
   * emitting the correct events.
   */
  public _create?: () => void;
  public _start?: () => void;
  public _stop?: () => void;
  public _destroy?: () => void;

  private _created = false;
  private _running = false;
  private _destroyed = false;

  constructor() {
    super();
  }

  get objectName(): string {
    if (this.generalConfiguration.namespace) {
      return `${this.generalConfiguration.namespace}_${this.name}`;
    }
    return this.name;
  }

  get state(): ResourceState {
    if (!this._created) {
      return ResourceState.NEW;
    } else if (this._destroyed) {
      return ResourceState.DESTROYED;
    } else if (this._running) {
      return ResourceState.RUNNING;
    } else {
      // If created but not running, and its last state was 'NEW', then
      // it's CREATED.
      if (this.previousState === ResourceState.NEW) {
        return ResourceState.CREATED;
      } else {
        // Otherwise it went from running to not running, so its state is
        // STOPPED.
        return ResourceState.STOPPED;
      }
    }
  }

  get status(): ResourceStatus {
    return new ResourceStatus({
      created: this._created,
      running: this._running,
      destroyed: this._destroyed,
      error: this._error,
      state: this.state,
    });
  }

  public clearError = () => {
    this._error = undefined;
  };

  public setAndEmitError(error: Error) {
    this._error = error;
    this.emit(BaseResource.EVENTS.error, error);
  }

  set created(isCreated: boolean) {
    this._created = isCreated;
  }

  set running(isRunning: boolean) {
    this._running = isRunning;
  }

  set destroyed(isDestroyed: boolean) {
    this._destroyed = isDestroyed;
  }

  set configuration(configuration: GeneralConfiguration) {
    this.generalConfiguration = configuration;
  }

  public emitStateChange(stateChangeEvent: symbol) {
    this.mostRecentStateChange = stateChangeEvent;
    this.emit(BaseResource.EVENTS.stateChange, {
      newState: BaseResource.EVENT_DESCRIPTIONS[stateChangeEvent],
    });
  }

  public create = async (): Promise<void> => {
    this.clearError();
    const currentState = this.state;

    try {
      if (this._create && typeof this._create === 'function') {
        this._create();
      }

      this._created = true;

      this.emit(BaseResource.EVENTS.created, this.status);
      this.emitStateChange(BaseResource.EVENTS.created);

      this.previousState = currentState;

    } catch (e) {
      this.setAndEmitError(e);
      this._created = false;
    }
  };

  public start = async (): Promise<void> => {
    const currentState = this.state;
    this.emitStateChange(BaseResource.EVENTS.starting);
    this._running = true;
    this.clearError();
    this.previousState = currentState;
    this.emitStateChange(BaseResource.EVENTS.started);
    this.emit(BaseResource.EVENTS.started, this.status);
  };

  public restart = async (): Promise<void> => {
    await this.stop();
    await this.start();
  };

  public stop = async (): Promise<void> => {
    const currentState = this.state;
    this.emitStateChange(BaseResource.EVENTS.stopping);
    this.emit(BaseResource.EVENTS.stopping, this.status);
    this._running = false;
    this.clearError();
    this.previousState = currentState;
    this.emitStateChange(BaseResource.EVENTS.stopped);
    this.emit(BaseResource.EVENTS.stopped, this.status);
  };

  public destroy = async (): Promise<void> => {
    const currentState = this.state;
    this.emitStateChange(BaseResource.EVENTS.destroying);
    this.clearError();
    this._destroyed = true;
    this.previousState = currentState;
    this.emit(BaseResource.EVENTS.destroyed, this.status);
    this.emitStateChange(BaseResource.EVENTS.destroyed);
  };

  /**
   * Registers a log event handler for stdout or stderr (or both).
   *
   * @param event
   * @param stdoutHandler
   * @param stderrHandler
   */
  public registerLogEventHandler = (
    event: string,
    stdoutHandler?: (...args: Array<string>) => void,
    stderrHandler?: (...args: Array<string>) => void
  ): void => {
    if (typeof stdoutHandler === 'function') {
      this.stdout.on(event, stdoutHandler);
    }

    if (typeof stderrHandler === 'function') {
      this.stdout.on(event, stderrHandler);
    }
  };
}
