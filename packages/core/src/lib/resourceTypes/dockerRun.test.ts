import debug from 'debug';
import DockerRunResource from "./dockerRun";
import BaseResource from "./base";
import DockerBaseResource from "./dockerBase";
import { ResourceStatus } from "@symphonic/core";

const dbg = debug("symphonic:test:core:resource-types:docker-run");

describe("resourceTypes/dockerRun", () => {
  it("correctly instantiates", () => {
    const testResource = new DockerRunResource();
    expect(testResource instanceof DockerRunResource).toBeTruthy();
    expect(testResource instanceof DockerBaseResource).toBeTruthy();
    expect(testResource instanceof BaseResource).toBeTruthy();
  });

  it("correctly creates a container", (done) => {
    const testResource = new DockerRunResource(
      {
        containerName: "test-container",
        failIfExists: false,
        image: "hello-world",
        remove: true,
        hostname: "testhost",
        env: [ "FOO=bar" ],
        networkMode: "none"
      }, {

      }, {
        namespace: "test"
      }
    );

    expect(testResource.status).toStrictEqual(new ResourceStatus({
      created: false,
      running: false,
      destroyed: false,
      ready: false,
    }));
    expect(testResource.stderr).not.toBeUndefined();
    expect(testResource.stdout).not.toBeUndefined();
  })

})
