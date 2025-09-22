import { DataAwsSubnet } from "@cdktf/provider-aws/lib/data-aws-subnet";
import { Lb } from "@cdktf/provider-aws/lib/lb";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { Fn, Token } from "cdktf";
import { Construct } from "constructs";
import { ILinkable, Linkage } from "../../linkage";

declare module "@cdktf/provider-aws/lib/lb" {
  interface Lb extends ILinkable {}
}

const OriginalLb = Lb;

//@ts-expect-error override constructor
Lb = function (...args: [scope: Construct, id: string, config: any]): Lb {
  const lb = Reflect.construct(OriginalLb, args) as Lb;
  const scope = lb.node.scope;
  if (!scope) {
    throw new Error("LB must have a scope");
  }
  Object.defineProperty(lb, "linkage", {
    get() {
      //@ts-expect-error check lb type
      if (lb._linkage == null) {
        throw new Error(
          "Only Application and Network Load Balancer has linkage",
        );
      }
      //@ts-expect-error return private field
      return lb._linkage;
    },
  });
  if (Token.isUnresolved(lb.loadBalancerTypeInput)) {
    throw new Error(
      "loadBalancerType cannot be a Token. It must be a concrete value at synthesis time.",
    );
  }
  if (
    lb.loadBalancerTypeInput === "application" ||
    lb.loadBalancerTypeInput === "network"
  ) {
    const subnetId = (() => {
      const mappingInput = lb.subnetMappingInput;
      if (mappingInput != null && Array.isArray(mappingInput)) {
        const mappingSubnetId = mappingInput[0]?.subnetId;
        if (mappingSubnetId != null) {
          return mappingSubnetId;
        }
      }
      const subnetId = lb.subnetsInput?.[0];
      if (subnetId != null) {
        return subnetId;
      }
      throw new Error("Subnet ID must be specified");
    })();
    const sg = new SecurityGroup(scope, `${lb.node.id}-SG`, {
      name: `${lb.node.id}-SG`,
      description: `Security group for ${lb.node.id}`,
      vpcId: new DataAwsSubnet(scope, `${lb.node.id}-SubnetData`, {
        id: subnetId,
      }).vpcId,
    });
    lb.securityGroups = Fn.flatten([[lb.securityGroupsInput], sg.id]);
    Object.defineProperty(lb, "_linkage", {
      value: new Linkage(scope, `${lb.node.id}-Linkage`, {
        peer: sg,
      }),
    });
  }
  return lb;
};

Object.setPrototypeOf(Lb, OriginalLb);
