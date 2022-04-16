import BaseResource from "./base";
import ResourceStatus from "../utilities/resourceStatus";

import debug from 'debug';
const log = debug("symphonic:core:resources:aggregate");

export default class AggregateResource extends BaseResource {
  public static type: 'aggregate' = 'aggregate';
  public type: 'aggregate' = AggregateResource.type;

  public run = async (): Promise<ResourceStatus> => {
    log("Starting aggregate resource.");

    return;
  }
}

