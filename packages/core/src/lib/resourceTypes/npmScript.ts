import BaseResource from "./base";

import debug from 'debug';
import ResourceStatus from "../utilities/resourceStatus";
const log = debug("symphonic:core:resources:npm-script");

export default class NpmScriptResource extends BaseResource {
  public static readonly type: 'npmScript' = 'npmScript';
  public type?: 'npmScript' = NpmScriptResource.type;


  public run = async (): Promise<ResourceStatus> => {
    log("Starting npm script resource.");

    return;
  }
}
