import { BatchComputeEnvironment } from "@cdktf/provider-aws/lib/batch-compute-environment";
import { DataAwsSubnet } from "@cdktf/provider-aws/lib/data-aws-subnet";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { Fn } from "cdktf";
import { Construct } from "constructs";
import { ILinkable, Linkage } from "../../linkage";

declare module "@cdktf/provider-aws/lib/batch-compute-environment" {
  interface BatchComputeEnvironment extends ILinkable {}
}

const OriginalBatchComputeEnvironment = BatchComputeEnvironment;

//@ts-expect-error override constructor
BatchComputeEnvironment = function (
  ...args: [scope: Construct, id: string, config: any]
): BatchComputeEnvironment {
  const batch = Reflect.construct(
    OriginalBatchComputeEnvironment,
    args,
  ) as BatchComputeEnvironment;
  const scope = batch.node.scope;
  if (!scope) {
    throw new Error("Batch Compute Environment must have a scope");
  }

  const subnetId = batch.computeResources.subnetsInput?.[0];
  if (subnetId == null) {
    throw new Error("Subnet ID must be specified");
  }

  const sg = new SecurityGroup(scope, `${batch.node.id}-SG`, {
    name: `${batch.node.id}-SG`,
    description: `Security group for ${batch.node.id}`,
    vpcId: new DataAwsSubnet(scope, `${batch.node.id}-SubnetData`, {
      id: subnetId,
    }).vpcId,
  });
  batch.computeResources.securityGroupIds = Fn.flatten([
    [batch.computeResources.securityGroupIdsInput],
    sg.id,
  ]);
  Object.defineProperty(batch, "linkage", {
    value: new Linkage(scope, `${batch.node.id}-Linkage`, {
      peer: sg,
    }),
  });
  return batch;
};

Object.setPrototypeOf(BatchComputeEnvironment, OriginalBatchComputeEnvironment);
