import { DataAwsSubnet } from "@cdktf/provider-aws/lib/data-aws-subnet";
import { EcsTaskSet } from "@cdktf/provider-aws/lib/ecs-task-set";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { Fn } from "cdktf";
import { Construct } from "constructs";
import { ILinkable, Linkage } from "../../linkage";

declare module "@cdktf/provider-aws/lib/ecs-task-set" {
  interface EcsTaskSet extends ILinkable {}
}

const OriginalEcsTaskSet = EcsTaskSet;
//@ts-expect-error
EcsTaskSet = function (
  ...args: [scope: Construct, id: string, config: any]
): EcsTaskSet {
  const ecsTaskSet = Reflect.construct(OriginalEcsTaskSet, args) as EcsTaskSet;
  const scope = ecsTaskSet.node.scope;
  if (!scope) {
    throw new Error("ECS Task Set must have a scope");
  }
  Object.defineProperty(ecsTaskSet, "linkage", {
    get() {
      //@ts-expect-error
      if (ecsTaskSet._linkage == null) {
        throw new Error("This ECS Task Set is not associated with a VPC");
      }
      //@ts-expect-error
      return ecsTaskSet._linkage;
    },
  });

  if (ecsTaskSet.networkConfigurationInput != null) {
    const subnet = ecsTaskSet.networkConfiguration.subnetsInput?.[0];
    if (subnet == null) {
      throw new Error("Subnet ID must be specified");
    }
    const sg = new SecurityGroup(scope, `${ecsTaskSet.node.id}-SG`, {
      name: `${ecsTaskSet.node.id}-SG`,
      description: `Security group for ${ecsTaskSet.node.id}`,
      vpcId: new DataAwsSubnet(scope, `${ecsTaskSet.node.id}-SubnetData`, {
        id: subnet,
      }).vpcId,
    });
    ecsTaskSet.networkConfiguration.securityGroups = Fn.flatten([
      [ecsTaskSet.networkConfiguration.securityGroupsInput],
      sg.id,
    ]);
    Object.defineProperty(ecsTaskSet, "_linkage", {
      value: new Linkage(scope, `${ecsTaskSet.node.id}-Linkage`, {
        peer: sg,
      }),
    });
  }

  return ecsTaskSet;
};

Object.setPrototypeOf(EcsTaskSet, OriginalEcsTaskSet);
