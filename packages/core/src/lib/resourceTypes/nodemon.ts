import BaseResource from "./base";

import debug from 'debug';
const log = debug("symphonic:core:resources:nodemon");

export default class NodemonResource extends BaseResource {
  public static readonly type: 'nodemon' = 'nodemon';
  public type: 'nodemon' = NodemonResource.type;


  public start = async (): Promise<void> => {
    log("Starting nodemon resource.");

    return;
  }
};
