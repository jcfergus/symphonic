import termkit, { terminal, ScreenBuffer, Palette } from 'terminal-kit';

import { ResourceStatus } from "@symphonic/core";
import SymphonicTermUiStatusScreen from "./statusScreen";

export default class SymphonicTermUi {
  private _rootBuffer: ScreenBuffer;
  private _statusScreen: SymphonicTermUiStatusScreen;
  private _statusBarBuffer: ScreenBuffer;

  private _logBuffers: Array<ScreenBuffer>;

  /**
   * An array of ResourceStatus objects which will be used to render the status bar
   * and the status page.
   */
  private _resourceStatuses: Record<string, ResourceStatus> = {};

  private _term = terminal;

  constructor() {
    this._rootBuffer = new ScreenBuffer({ dst: this._term });

    this._statusScreen = new SymphonicTermUiStatusScreen(this._rootBuffer, this._resourceStatuses);

    this._statusBarBuffer = ScreenBuffer.create({
      dst: this._rootBuffer,
      height: 1,
      x: 0,
      y: this._rootBuffer.height - 1,
      palette: new Palette(),
      attr: {
        bgColor: 'green',
        color: 'white',
      },
    });
  }

  private registerKeyHandlers = () => {
    this._term.grabInput();
    this._term.on('key', (name: string, matches: Array<string>, data: any) => {
      if (name === "ESCAPE") {
        this._term.grabInput(false);
        this._term.bgBlack();
        this._term.clear();
        this._term.processExit();

        setTimeout( () => { this._term.processExit() }, 100);
      }
    })
  }

  public init = () => {
    this._statusBarBuffer.fill({ attr: { bgColor: "green", color: "black" }})
    this._statusBarBuffer.put({ x: 0, y: 0, wrap: false, attr: { bgColor: "green", color: "black" } }, 'Hello world.');
  };

  public run = () => {
    this._term.clear();
    this.registerKeyHandlers();
    this._statusBarBuffer.draw();
    this._rootBuffer.draw();
    this._statusScreen.render();
    this._term.moveTo(1,1);
  };
}
