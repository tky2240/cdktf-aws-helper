import { DataAwsSubnet } from "@cdktf/provider-aws/lib/data-aws-subnet";
import { DataAwsVpc } from "@cdktf/provider-aws/lib/data-aws-vpc";
import { Instance } from "@cdktf/provider-aws/lib/instance";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { Fn } from "cdktf";
import { Construct } from "constructs";
import { ILinkable, Linkage } from "../../linkage";

declare module "@cdktf/provider-aws/lib/instance" {
  interface Instance extends ILinkable {}
}

const OriginalInstance = Instance;

//@ts-expect-error override constructor
Instance = function (
  ...args: [scope: Construct, id: string, config: any]
): Instance {
  const instance = Reflect.construct(OriginalInstance, args) as Instance;
  const scope = instance.node.scope;
  if (!scope) {
    throw new Error("Instance must have a scope");
  }
  const sg = new SecurityGroup(scope, `${instance.node.id}-SG`, {
    name: `${instance.node.id}-SG`,
    description: `Security group for ${instance.node.id}`,
    vpcId: (() => {
      if (instance.subnetIdInput == null) {
        return new DataAwsVpc(scope, `${instance.node.id}-VPCData`, {
          default: true,
        }).id;
      }
      return new DataAwsSubnet(scope, `${instance.node.id}-SubnetData`, {
        id: instance.subnetIdInput,
      }).vpcId;
    })(),
  });
  instance.vpcSecurityGroupIds = Fn.flatten([
    [instance.vpcSecurityGroupIdsInput],
    sg.id,
  ]);
  Object.defineProperty(instance, "linkage", {
    value: new Linkage(scope, `${instance.node.id}-Linkage`, {
      peer: sg,
    }),
  });
  return instance;
};

Object.setPrototypeOf(Instance, OriginalInstance);
