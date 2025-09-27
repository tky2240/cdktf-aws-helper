import { LambdaFunction } from "@cdktf/provider-aws/lib/lambda-function";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "../../src/resources/linkables/lambda-function";
import {
  createSecurityGroupInput,
  createVpcIdString,
  TestSuite,
} from "./suite";

const constructId = "test-lambda-function";

export const LAMBDA_FUNCTION_TEST_SUITE: TestSuite<typeof LambdaFunction> = {
  specifySecurityGroup: {
    inputConfig: {
      functionName: "test-lambda-fn",
      role: "arn:aws:iam::123456789012:role/lambda_role",
      vpcConfig: {
        subnetIds: ["subnet-123456"],
        securityGroupIds: ["sg-123456"],
      },
    },
    inputStackConstructor: (scope, config) => {
      new LambdaFunction(scope, constructId, config);
    },
    expectedSecurityGroupIdsString: createSecurityGroupInput(constructId, [
      {
        isToken: false,
        value: "sg-123456",
      },
    ]),
    expectedSecurityGroupName: `${constructId}-SG`,
    expectedVpcIdString: createVpcIdString(constructId, "subnet"),
    expectedDataAwsSubnet: "subnet-123456",
    expectedError: false,
  },
  specifyNoSecurityGroup: {
    inputConfig: {
      functionName: "test-lambda-fn",
      role: "arn:aws:iam::123456789012:role/lambda_role",
      vpcConfig: {
        subnetIds: ["subnet-123456"],
        securityGroupIds: [],
      },
    },
    inputStackConstructor: (scope, config) => {
      new LambdaFunction(scope, constructId, config);
    },
    expectedSecurityGroupIdsString: createSecurityGroupInput(constructId, []),
    expectedSecurityGroupName: `${constructId}-SG`,
    expectedVpcIdString: createVpcIdString(constructId, "subnet"),
    expectedDataAwsSubnet: "subnet-123456",
    expectedError: false,
  },
  specifyTokenizedSecurityGroup: {
    inputConfig: {
      functionName: "test-lambda-fn",
      role: "arn:aws:iam::123456789012:role/lambda_role",
      vpcConfig: {
        subnetIds: ["subnet-123456"],
        securityGroupIds: [],
      },
    },
    inputStackConstructor: (scope, config) => {
      const sg = new SecurityGroup(scope, "sg", {
        name: "test-sg",
        vpcId: "vpc-123456",
      });
      if (config.vpcConfig == null) {
        throw new Error("vpcConfig is undefined");
      }
      new LambdaFunction(scope, constructId, {
        ...config,
        vpcConfig: {
          ...config.vpcConfig,
          securityGroupIds: [sg.id],
        },
      });
    },
    expectedSecurityGroupIdsString: createSecurityGroupInput(constructId, [
      { isToken: true, value: "aws_security_group.sg.id" },
    ]),
    expectedSecurityGroupName: `${constructId}-SG`,
    expectedVpcIdString: createVpcIdString(constructId, "subnet"),
    expectedDataAwsSubnet: "subnet-123456",
    expectedError: false,
  },
  specifiyNoSubnet: {
    inputConfig: {
      functionName: "test-lambda-fn",
      role: "arn:aws:iam::123456789012:role/lambda_role",
      vpcConfig: {
        subnetIds: [],
        securityGroupIds: ["sg-123456"],
      },
    },
    inputStackConstructor: (scope, config) => {
      new LambdaFunction(scope, constructId, config);
    },
    expectedError: true,
  },
} as const;
