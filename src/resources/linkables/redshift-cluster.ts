import { DataAwsRedshiftSubnetGroup } from "@cdktf/provider-aws/lib/data-aws-redshift-subnet-group";
import { DataAwsSubnet } from "@cdktf/provider-aws/lib/data-aws-subnet";
import { DataAwsVpc } from "@cdktf/provider-aws/lib/data-aws-vpc";
import {
  RedshiftCluster,
  RedshiftClusterConfig,
} from "@cdktf/provider-aws/lib/redshift-cluster";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { Fn } from "cdktf";
import { Construct } from "constructs";
import { ILinkable, Linkage } from "../../linkage";

declare module "@cdktf/provider-aws/lib/redshift-cluster" {
  interface RedshiftCluster extends ILinkable {}
}

const OriginalRedshiftCluster = RedshiftCluster;

//@ts-expect-error override constructor
RedshiftCluster = function (
  ...args: [scope: Construct, id: string, config: RedshiftClusterConfig]
): RedshiftCluster {
  const cluster = Reflect.construct(OriginalRedshiftCluster, args);
  const scope = cluster.node.scope;
  if (!scope) {
    throw new Error("Redshift Cluster must have a scope");
  }

  const vpcId = (() => {
    if (cluster.clusterSubnetGroupNameInput == null) {
      return new DataAwsVpc(scope, `${cluster.node.id}-VPCData`, {
        default: true,
      }).id;
    }
    const subnetIds = new DataAwsRedshiftSubnetGroup(
      scope,
      `${cluster.node.id}-SubnetGroupData`,
      {
        name: cluster.clusterSubnetGroupNameInput,
      },
    ).subnetIds;
    if (subnetIds == null) {
      throw new Error("Subnet IDs not found in the Redshift Subnet Group");
    }
    return new DataAwsSubnet(scope, `${cluster.node.id}-SubnetData`, {
      id: Fn.element(subnetIds, 0),
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

Object.setPrototypeOf(RedshiftCluster, OriginalRedshiftCluster);
