import ShellCommandResource from "./resourceTypes/shellCommand";
import DockerNetworkResource from "./resourceTypes/dockerNetwork";
import NodemonResource from "./resourceTypes/nodemon";
import AggregateResource from "./resourceTypes/aggregate";
import DockerRunResource from "./resourceTypes/dockerRun";
import NpmScriptResource from "./resourceTypes/npmScript";
import DockerVolumeResource from "./resourceTypes/dockerVolume";
import TsNodeDevResource from "./resourceTypes/tsNodeDev";

type ResourceConfiguration = ShellCommandResource
                             | DockerNetworkResource | DockerVolumeResource | DockerRunResource
                             | NodemonResource | NpmScriptResource | TsNodeDevResource
                             | AggregateResource;

const resourceSubTypeDiscriminator = [
    { value: AggregateResource, name: AggregateResource.type },
    { value: DockerNetworkResource, name: DockerNetworkResource.type },
    { value: DockerRunResource, name: DockerRunResource.type },
    { value: DockerVolumeResource, name: DockerVolumeResource.type },
    { value: NodemonResource, name: NodemonResource.type },
    { value: NpmScriptResource, name: NpmScriptResource.type },
    { value: ShellCommandResource, name: ShellCommandResource.type },
    { value: TsNodeDevResource, name: TsNodeDevResource.type },
];

export { resourceSubTypeDiscriminator };
export default ResourceConfiguration;
