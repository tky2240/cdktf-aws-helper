import { DataAwsSubnet } from "@cdktf/provider-aws/lib/data-aws-subnet";
import { MskCluster } from "@cdktf/provider-aws/lib/msk-cluster";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { Fn } from "cdktf";
import { Construct } from "constructs";
import { ILinkable, Linkage } from "../../linkage";

declare module "@cdktf/provider-aws/lib/msk-cluster" {
  interface MskCluster extends ILinkable {}
}

const OriginalMskCluster = MskCluster;

//@ts-expect-error
MskCluster = function (
  ...args: [scope: Construct, id: string, config: any]
): MskCluster {
  const cluster = Reflect.construct(OriginalMskCluster, args) as MskCluster;
  const scope = cluster.node.scope;
  if (!scope) {
    throw new Error("MSK Cluster must have a scope");
  }

  const subnetId = cluster.brokerNodeGroupInfo.clientSubnetsInput?.[0];
  if (subnetId == null) {
    throw new Error("Subnet ID must be specified");
  }
  const sg = new SecurityGroup(scope, `${cluster.node.id}-SG`, {
    name: `${cluster.node.id}-SG`,
    description: `Security group for ${cluster.node.id}`,
    vpcId: new DataAwsSubnet(scope, `${cluster.node.id}-SubnetData`, {
      id: subnetId,
    }).vpcId,
  });
  cluster.brokerNodeGroupInfo.securityGroups = Fn.flatten([
    [cluster.brokerNodeGroupInfo.securityGroupsInput],
    sg.id,
  ]);
  Object.defineProperty(cluster, "linkage", {
    value: new Linkage(scope, `${cluster.node.id}-Linkage`, {
      peer: sg,
    }),
  });
  return cluster;
};

Object.setPrototypeOf(MskCluster, OriginalMskCluster);
