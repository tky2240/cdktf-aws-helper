import { ApprunnerVpcConnector } from "@cdktf/provider-aws/lib/apprunner-vpc-connector";
import { DataAwsSubnet } from "@cdktf/provider-aws/lib/data-aws-subnet";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { Fn } from "cdktf";
import { Construct } from "constructs";
import { ILinkable, Linkage } from "../../linkage";

declare module "@cdktf/provider-aws/lib/apprunner-vpc-connector" {
  interface ApprunnerVpcConnector extends ILinkable {}
}

const OriginalApprunnerVpcConnector = ApprunnerVpcConnector;

//@ts-expect-error
ApprunnerVpcConnector = function (
  ...args: [scope: Construct, id: string, config: any]
): ApprunnerVpcConnector {
  const connector = Reflect.construct(
    OriginalApprunnerVpcConnector,
    args,
  ) as ApprunnerVpcConnector;
  const scope = connector.node.scope;
  if (!scope) {
    throw new Error("Apprunner VPC Connector must have a scope");
  }
  const subnetId = connector.subnetsInput?.[0];
  if (subnetId == null) {
    throw new Error("Subnet ID must be specified");
  }
  const sg = new SecurityGroup(scope, `${connector.node.id}-SG`, {
    name: `${connector.node.id}-SG`,
    description: `Security group for ${connector.node.id}`,
    vpcId: new DataAwsSubnet(scope, `${connector.node.id}-SubnetData`, {
      id: subnetId,
    }).vpcId,
  });
  connector.securityGroups = Fn.flatten([connector.securityGroupsInput, sg.id]);
  Object.defineProperty(connector, "linkage", {
    value: new Linkage(scope, `${connector.node.id}-Linkage`, {
      peer: sg,
    }),
  });
  return connector;
};

Object.setPrototypeOf(ApprunnerVpcConnector, OriginalApprunnerVpcConnector);
