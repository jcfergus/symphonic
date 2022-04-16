import BaseResource from "./base";

import debug from 'debug';
import ResourceStatus from "../utilities/resourceStatus";
const log = debug("symphonic:core:resources:nodemon");

export default class NodemonResource extends BaseResource {
  public static readonly type: 'nodemon' = 'nodemon';
  public type: 'nodemon' = NodemonResource.type;


  public run = async (): Promise<ResourceStatus> => {
    log("Starting nodemon resource.");

    return;
  }
};
