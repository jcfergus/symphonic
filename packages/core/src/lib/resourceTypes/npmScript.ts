import BaseResource from "./base";

import debug from 'debug';
const log = debug("symphonic:core:resources:npm-script");

export default class NpmScriptResource extends BaseResource {
  public static readonly type: 'npmScript' = 'npmScript';
  public type?: 'npmScript' = NpmScriptResource.type;


  public start = async (): Promise<void> => {
    log("Starting npm script resource.");

    return;
  }
}
