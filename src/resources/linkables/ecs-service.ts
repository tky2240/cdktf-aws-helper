import { DataAwsSubnet } from "@cdktf/provider-aws/lib/data-aws-subnet";
import { EcsService } from "@cdktf/provider-aws/lib/ecs-service";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { Fn } from "cdktf";
import { Construct } from "constructs";
import { ILinkable, Linkage } from "../../linkage";

declare module "@cdktf/provider-aws/lib/ecs-service" {
  interface EcsService extends ILinkable {}
}

const OriginalEcsService = EcsService;
//@ts-expect-error override constructor
EcsService = function (
  ...args: [scope: Construct, id: string, config: any]
): EcsService {
  const ecsService = Reflect.construct(OriginalEcsService, args) as EcsService;
  const scope = ecsService.node.scope;
  if (!scope) {
    throw new Error("ECS Service must have a scope");
  }
  Object.defineProperty(ecsService, "linkage", {
    get() {
      //@ts-expect-error check vpc association
      if (ecsService._linkage == null) {
        throw new Error("This ECS Service is not associated with a VPC");
      }
      //@ts-expect-error return private field
      return ecsService._linkage;
    },
  });

  if (ecsService.networkConfigurationInput != null) {
    const subnet = ecsService.networkConfiguration.subnetsInput?.[0];
    if (subnet == null) {
      throw new Error("Subnet ID must be specified");
    }
    const sg = new SecurityGroup(scope, `${ecsService.node.id}-SG`, {
      name: `${ecsService.node.id}-SG`,
      description: `Security group for ${ecsService.node.id}`,
      vpcId: new DataAwsSubnet(scope, `${ecsService.node.id}-SubnetData`, {
        id: subnet,
      }).vpcId,
    });
    ecsService.networkConfiguration.securityGroups = Fn.flatten([
      [ecsService.networkConfiguration.securityGroupsInput],
      sg.id,
    ]);
    Object.defineProperty(ecsService, "_linkage", {
      value: new Linkage(scope, `${ecsService.node.id}-Linkage`, {
        peer: sg,
      }),
    });
  }

  return ecsService;
};

Object.setPrototypeOf(EcsService, OriginalEcsService);
