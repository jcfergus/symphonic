import BaseResource from "./base";

import debug from 'debug';
import ResourceStatus from "../utilities/resourceStatus";
const log = debug("symphonic:core:resources:shell-command");

export default class ShellCommandResource extends BaseResource {

  public static readonly type: 'shellCommand' = 'shellCommand';
  public type?: 'shellCommand' = ShellCommandResource.type;

  public command?: string;
  public envVars?: Array<string>;
  public output?: Array<string>;

  timeout?: number;


  public run = async (): Promise<ResourceStatus> => {
    log("Starting shell command resource.");

    return;
  }
}
