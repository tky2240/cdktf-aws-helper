import { DataAwsSubnet } from "@cdktf/provider-aws/lib/data-aws-subnet";
import { EfsMountTarget } from "@cdktf/provider-aws/lib/efs-mount-target";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { Fn } from "cdktf";
import { Construct } from "constructs";
import { ILinkable, Linkage } from "../../linkage";

declare module "@cdktf/provider-aws/lib/efs-mount-target" {
  interface EfsMountTarget extends ILinkable {}
}

const OriginalEfsMountTarget = EfsMountTarget;

//@ts-expect-error
EfsMountTarget = function (
  ...args: [scope: Construct, id: string, config: any]
): EfsMountTarget {
  const target = Reflect.construct(
    OriginalEfsMountTarget,
    args,
  ) as EfsMountTarget;
  const scope = target.node.scope;
  if (!scope) {
    throw new Error("EFS Mount Target must have a scope");
  }
  const subnetId = target.subnetIdInput;
  if (subnetId == null) {
    throw new Error("Subnet ID must be specified");
  }
  const sg = new SecurityGroup(scope, `${target.node.id}-SG`, {
    name: `${target.node.id}-SG`,
    description: `Security group for ${target.node.id}`,
    vpcId: new DataAwsSubnet(scope, `${target.node.id}-SubnetData`, {
      id: subnetId,
    }).vpcId,
  });
  target.securityGroups = Fn.flatten([[target.securityGroupsInput], sg.id]);
  Object.defineProperty(target, "linkage", {
    value: new Linkage(scope, `${target.node.id}-Linkage`, {
      peer: sg,
    }),
  });
  return target;
};

Object.setPrototypeOf(EfsMountTarget, OriginalEfsMountTarget);
