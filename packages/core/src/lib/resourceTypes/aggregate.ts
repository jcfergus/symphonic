import BaseResource from "./base";

import debug from 'debug';
import ResourceStatus from "../utilities/resourceStatus";
const dbg = debug("symphonic:core:resources:aggregate");

export default class AggregateResource extends BaseResource {
  public static type: 'aggregate' = 'aggregate';
  public type: 'aggregate' = AggregateResource.type;

  // Aggregate resources simply roll up the status from all of the children. Unfortunately,
  // that means we have to keep references to the children on the object.

  get status(): ResourceStatus {
    const dependentStatuses = this.dependencies.map((r) => r.status);

    return new ResourceStatus({
      created: dependentStatuses.every((r) => r.created),
      running: dependentStatuses.every((r) => r.running),
      ready: dependentStatuses.every((r) => r.ready),
      destroyed: dependentStatuses.every((r) => r.destroyed),
    });
  }
}

