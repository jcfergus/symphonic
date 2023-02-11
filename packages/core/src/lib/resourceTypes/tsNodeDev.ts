import BaseResource from "./base";

import debug from 'debug';
import ResourceStatus from "../utilities/resourceStatus";

const log = debug("symphonic:core:resources:ts-node-dev");

export default class TsNodeDevResource extends BaseResource {
  public static readonly type: 'ts-node-dev';
  public type: 'ts-node-dev' = TsNodeDevResource.type;

  public start = async (): Promise<void> => {
    log("Starting ts-node-dev resource.");

    return;
  }
}
