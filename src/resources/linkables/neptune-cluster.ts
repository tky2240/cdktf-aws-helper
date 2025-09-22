import { DataAwsDbSubnetGroup } from "@cdktf/provider-aws/lib/data-aws-db-subnet-group";
import { DataAwsVpc } from "@cdktf/provider-aws/lib/data-aws-vpc";
import { NeptuneCluster } from "@cdktf/provider-aws/lib/neptune-cluster";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { Fn } from "cdktf";
import { Construct } from "constructs";
import { ILinkable, Linkage } from "../../linkage";

declare module "@cdktf/provider-aws/lib/neptune-cluster" {
  interface NeptuneCluster extends ILinkable {}
}

const OriginalNeptuneCluster = NeptuneCluster;

//@ts-expect-error override constructor
NeptuneCluster = function (
  ...args: [scope: Construct, id: string, config: any]
): NeptuneCluster {
  const cluster = Reflect.construct(
    OriginalNeptuneCluster,
    args,
  ) as NeptuneCluster;
  const scope = cluster.node.scope;
  if (!scope) {
    throw new Error("Neptune Cluster must have a scope");
  }

  const subnetGroupName = cluster.neptuneSubnetGroupNameInput;
  const vpcId = (() => {
    if (subnetGroupName == null) {
      return new DataAwsVpc(scope, `${cluster.node.id}-VPCData`, {
        default: true,
      }).id;
    }
    return new DataAwsDbSubnetGroup(scope, `${cluster.node.id}-SubnetData`, {
      name: subnetGroupName,
    }).vpcId;
  })();

  const sg = new SecurityGroup(scope, `${cluster.node.id}-SG`, {
    name: `${cluster.node.id}-SG`,
    description: `Security group for ${cluster.node.id}`,
    vpcId: vpcId,
  });
  cluster.vpcSecurityGroupIds = Fn.flatten([
    [cluster.vpcSecurityGroupIdsInput],
    sg.id,
  ]);
  Object.defineProperty(cluster, "linkage", {
    value: new Linkage(scope, `${cluster.node.id}-Linkage`, {
      peer: sg,
    }),
  });
  return cluster;
};

Object.setPrototypeOf(NeptuneCluster, OriginalNeptuneCluster);
