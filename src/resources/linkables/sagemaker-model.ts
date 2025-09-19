import { DataAwsSubnet } from "@cdktf/provider-aws/lib/data-aws-subnet";
import { DataAwsVpc } from "@cdktf/provider-aws/lib/data-aws-vpc";
import { SagemakerModel } from "@cdktf/provider-aws/lib/sagemaker-model";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { Fn } from "cdktf";
import { Construct } from "constructs";
import { ILinkable, Linkage } from "../../linkage";

declare module "@cdktf/provider-aws/lib/sagemaker-model" {
  interface SagemakerModel extends ILinkable {}
}

const OriginalSagemakerModel = SagemakerModel;

//@ts-expect-error
SagemakerModel = function (
  ...args: [scope: Construct, id: string, config: any]
): SagemakerModel {
  const model = Reflect.construct(
    OriginalSagemakerModel,
    args,
  ) as SagemakerModel;
  const scope = model.node.scope;
  if (!scope) {
    throw new Error("Sagemaker Model must have a scope");
  }

  const vpcId = (() => {
    if (model.vpcConfigInput == null) {
      return new DataAwsVpc(scope, `${model.node.id}-VPCData`, {
        default: true,
      }).id;
    }
    const subnetId = model.vpcConfig.subnetsInput?.[0];
    if (subnetId == null) {
      throw new Error("Subnet ID must be specified");
    }
    return new DataAwsSubnet(scope, `${model.node.id}-SubnetData`, {
      id: subnetId,
    }).vpcId;
  })();

  const sg = new SecurityGroup(scope, `${model.node.id}-SG`, {
    name: `${model.node.id}-SG`,
    description: `Security group for ${model.node.id}`,
    vpcId: vpcId,
  });
  model.vpcConfig.securityGroupIds = Fn.flatten([
    [model.vpcConfig.securityGroupIdsInput],
    sg.id,
  ]);
  Object.defineProperty(model, "linkage", {
    value: new Linkage(scope, `${model.node.id}-Linkage`, {
      peer: sg,
    }),
  });
  return model;
};

Object.setPrototypeOf(SagemakerModel, OriginalSagemakerModel);
