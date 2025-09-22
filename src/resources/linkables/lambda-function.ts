import { DataAwsSubnet } from "@cdktf/provider-aws/lib/data-aws-subnet";
import { LambdaFunction } from "@cdktf/provider-aws/lib/lambda-function";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { Fn } from "cdktf";
import { Construct } from "constructs";
import { ILinkable, Linkage } from "../../linkage";

declare module "@cdktf/provider-aws/lib/lambda-function" {
  interface LambdaFunction extends ILinkable {}
}

const OriginalLambdaFunction = LambdaFunction;

//@ts-expect-error override constructor
LambdaFunction = function (
  ...args: [scope: Construct, id: string, config: any]
): LambdaFunction {
  const lambda = Reflect.construct(
    OriginalLambdaFunction,
    args,
  ) as LambdaFunction;
  const scope = lambda.node.scope;
  if (!scope) {
    throw new Error("Lambda Function must have a scope");
  }
  Object.defineProperty(lambda, "linkage", {
    get() {
      //@ts-expect-error
      if (lambda._linkage == null) {
        throw new Error("This Lambda Function is not associated with a VPC");
      }
      //@ts-expect-error
      return lambda._linkage;
    },
  });

  if (lambda.vpcConfigInput != null) {
    const subnetId = lambda.vpcConfig.subnetIdsInput?.[0];
    if (subnetId == null) {
      throw new Error("Subnet ID must be specified");
    }
    const sg = new SecurityGroup(scope, `${lambda.node.id}-SG`, {
      name: `${lambda.node.id}-SG`,
      description: `Security group for ${lambda.node.id}`,
      vpcId: new DataAwsSubnet(scope, `${lambda.node.id}-SubnetData`, {
        id: subnetId,
      }).vpcId,
    });
    lambda.vpcConfig.securityGroupIds = Fn.flatten([
      [lambda.vpcConfig.securityGroupIdsInput],
      sg.id,
    ]);
    Object.defineProperty(lambda, "_linkage", {
      value: new Linkage(scope, `${lambda.node.id}-Linkage`, {
        peer: sg,
      }),
    });
  }
  return lambda;
};

Object.setPrototypeOf(LambdaFunction, OriginalLambdaFunction);
