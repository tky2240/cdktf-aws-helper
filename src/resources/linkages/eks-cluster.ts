import { DataAwsSubnet } from "@cdktf/provider-aws/lib/data-aws-subnet";
import { EksCluster } from "@cdktf/provider-aws/lib/eks-cluster";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { Fn } from "cdktf";
import { Construct } from "constructs";
import { ILinkable, Linkage } from "../../linkage";

declare module "@cdktf/provider-aws/lib/eks-cluster" {
  interface EksCluster extends ILinkable {}
}

const OriginalEksCluster = EksCluster;

//@ts-expect-error
EksCluster = function (
  ...args: [scope: Construct, id: string, config: any]
): EksCluster {
  const cluster = Reflect.construct(OriginalEksCluster, args) as EksCluster;
  const scope = cluster.node.scope;
  if (!scope) {
    throw new Error("EKS Cluster must have a scope");
  }

  const subnetId = cluster.vpcConfig.subnetIdsInput?.[0];
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
  cluster.vpcConfig.securityGroupIds = Fn.flatten([
    [cluster.vpcConfig.securityGroupIdsInput],
    sg.id,
  ]);
  Object.defineProperty(cluster, "linkage", {
    value: new Linkage(scope, `${cluster.node.id}-Linkage`, {
      peer: sg,
    }),
  });
  return cluster;
};

Object.setPrototypeOf(EksCluster, OriginalEksCluster);
