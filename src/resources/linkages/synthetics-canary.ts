import { DataAwsSubnet } from "@cdktf/provider-aws/lib/data-aws-subnet";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { SyntheticsCanary } from "@cdktf/provider-aws/lib/synthetics-canary";
import { Fn } from "cdktf";
import { Construct } from "constructs";
import { ILinkable, Linkage } from "../../linkage";

declare module "@cdktf/provider-aws/lib/synthetics-canary" {
  interface SyntheticsCanary extends ILinkable {}
}

const OriginalSyntheticsCanary = SyntheticsCanary;

//@ts-expect-error
SyntheticsCanary = function (
  ...args: [scope: Construct, id: string, config: any]
): SyntheticsCanary {
  const canary = Reflect.construct(
    OriginalSyntheticsCanary,
    args,
  ) as SyntheticsCanary;
  const scope = canary.node.scope;
  if (!scope) {
    throw new Error("Synthetics Canary must have a scope");
  }
  Object.defineProperty(canary, "linkage", {
    get() {
      //@ts-expect-error
      if (canary._linkage == null) {
        throw new Error("This Synthetics Canary is not associated with a VPC");
      }
      //@ts-expect-error
      return canary._linkage;
    },
  });
  if (canary.vpcConfigInput == null) {
    const subnetId = canary.vpcConfig.subnetIdsInput?.[0];
    if (subnetId == null) {
      throw new Error("Subnet ID must be specified");
    }

    const sg = new SecurityGroup(scope, `${canary.node.id}-SG`, {
      name: `${canary.node.id}-SG`,
      description: `Security group for ${canary.node.id}`,
      vpcId: new DataAwsSubnet(scope, `${canary.node.id}-SubnetData`, {
        id: subnetId,
      }).vpcId,
    });
    canary.vpcConfig.securityGroupIds = Fn.flatten([
      [canary.vpcConfig.securityGroupIdsInput],
      sg.id,
    ]);
    Object.defineProperty(canary, "linkage", {
      value: new Linkage(scope, `${canary.node.id}-Linkage`, {
        peer: sg,
      }),
    });
  }
  return canary;
};

Object.setPrototypeOf(SyntheticsCanary, OriginalSyntheticsCanary);
