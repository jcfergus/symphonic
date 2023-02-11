import BaseResource from "./base";
import { ResourceStatus } from "@symphonic/core";
import { ResourceState } from "../utilities/resourceStatus";

// In order to test the functionality provided by the abstract BaseResource,
// we need to create a non-abstract version to test with.
class TestBaseResource extends BaseResource { }

describe("resourceTypes/base", () => {

  let finalState: ResourceState;
  const stateChangeHandler = jest.fn((status: ResourceStatus) => {
    finalState = status.state;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    finalState = undefined;
  });

  it("correctly instantiates", () => {
    const testResource = new TestBaseResource();
    expect(testResource instanceof TestBaseResource).toBeTruthy();
    expect(testResource instanceof BaseResource).toBeTruthy();
    expect(testResource.state).toBe(ResourceState.NEW);
    expect(testResource.status).toStrictEqual(new ResourceStatus({
      "created": false,
      "destroyed": false,
      "error": undefined,
      "running": false,
      "state": ResourceState.NEW,
    }));
  });

  it("correctly transitions to `created` state", (done) => {
    const testResource = new TestBaseResource();

    const createHandler = jest.fn((status) => {
      expect(status).toStrictEqual(new ResourceStatus({
        "created": true,
        "destroyed": false,
        "error": undefined,
        "running": false,
        "state": ResourceState.CREATED,
      }));
    });

    testResource.on(BaseResource.EVENTS.created, createHandler);
    testResource.on(BaseResource.EVENTS.stateChange, stateChangeHandler);
    testResource.create();

    setTimeout(() => {
      expect(createHandler).toHaveBeenCalled();
      expect(stateChangeHandler).toHaveBeenCalledTimes(1);
      done();
    }, 100);
  });

  it("correctly transitions to `running` state", (done) => {
    const testResource = new TestBaseResource();

    const startHandler = jest.fn((status) => {
      expect(status).toStrictEqual(new ResourceStatus({
        "created": true,
        "destroyed": false,
        "error": undefined,
        "running": true,
        "state": ResourceState.RUNNING,
      }));
    });

    testResource.on(BaseResource.EVENTS.stateChange, stateChangeHandler);
    testResource.on(BaseResource.EVENTS.started, startHandler);
    testResource.create();
    testResource.start();

    setTimeout(() => {
      expect(startHandler).toHaveBeenCalled();
      expect(stateChangeHandler).toHaveBeenCalledTimes(3);
      done();
    }, 100);
  });

  it("correctly transitions to `stopped` state", (done) => {
    const testResource = new TestBaseResource();

    const stopHandler = jest.fn((status) => {
      expect(status).toStrictEqual(new ResourceStatus({
        "created": true,
        "destroyed": false,
        "error": undefined,
        "running": false,
        "state": ResourceState.STOPPED,
      }));
    });

    testResource.on(BaseResource.EVENTS.stateChange, stateChangeHandler);
    testResource.on(BaseResource.EVENTS.stopped, stopHandler);
    testResource.create();
    testResource.start();
    testResource.stop();

    setTimeout(() => {
      expect(stopHandler).toHaveBeenCalled();
      expect(stateChangeHandler).toHaveBeenCalledTimes(5);
      done();
    }, 100);
  });
})
