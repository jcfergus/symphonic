import DockerConfiguration from "./dockerConfiguration";

export default class GeneralConfiguration {
  namespace?: string;

  dockerConfiguration?: DockerConfiguration = new DockerConfiguration();

}
