import { DataAwsDbSubnetGroup } from "@cdktf/provider-aws/lib/data-aws-db-subnet-group";
import { DataAwsVpc } from "@cdktf/provider-aws/lib/data-aws-vpc";
import { RdsCluster } from "@cdktf/provider-aws/lib/rds-cluster";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { Fn } from "cdktf";
import { Construct } from "constructs";
import { ILinkable, Linkage } from "../../linkage";

declare module "@cdktf/provider-aws/lib/rds-cluster" {
  interface RdsCluster extends ILinkable {}
}

const OriginalRdsCluster = RdsCluster;

//@ts-expect-error override constructor
RdsCluster = function (
  ...args: [scope: Construct, id: string, config: any]
): RdsCluster {
  const cluster = Reflect.construct(OriginalRdsCluster, args) as RdsCluster;
  const scope = cluster.node.scope;
  if (!scope) {
    throw new Error("RDS Cluster must have a scope");
  }

  const subnetGroupName = cluster.dbSubnetGroupNameInput;
  const sg = new SecurityGroup(scope, `${cluster.node.id}-SG`, {
    name: `${cluster.node.id}-SG`,
    description: `Security group for ${cluster.node.id}`,
    vpcId: (() => {
      if (subnetGroupName) {
        return new DataAwsDbSubnetGroup(
          scope,
          `${cluster.node.id}-SubnetData`,
          {
            name: subnetGroupName,
          },
        ).vpcId;
      } else {
        return new DataAwsVpc(scope, `${cluster.node.id}-VPCData`, {
          default: true,
        }).id;
      }
    })(),
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

Object.setPrototypeOf(RdsCluster, OriginalRdsCluster);
