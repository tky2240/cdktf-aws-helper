import { SagemakerModel } from "@cdktf/provider-aws/lib/sagemaker-model";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "../../src/resources/linkables/sagemaker-model";
import {
  createSecurityGroupInput,
  createVpcIdString,
  TestSuite,
} from "./suite";

const constructId = "test-sagemaker-model";

export const SAGEMAKER_MODEL_TEST_SUITE: TestSuite<typeof SagemakerModel> = {
  specifySecurityGroup: {
    inputConfig: {
      name: "test-model",
      executionRoleArn: "arn:aws:iam::123456789012:role/SageMakerRole",
      vpcConfig: {
        securityGroupIds: ["sg-123456"],
        subnets: ["subnet-123456"],
      },
    },
    inputStackConstructor: (scope, config) => {
      new SagemakerModel(scope, constructId, config);
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
      name: "test-model",
      executionRoleArn: "arn:aws:iam::123456789012:role/SageMakerRole",
      vpcConfig: {
        securityGroupIds: [],
        subnets: ["subnet-123456"],
      },
    },
    inputStackConstructor: (scope, config) => {
      new SagemakerModel(scope, constructId, config);
    },
    expectedSecurityGroupIdsString: createSecurityGroupInput(constructId, []),
    expectedSecurityGroupName: `${constructId}-SG`,
    expectedVpcIdString: createVpcIdString(constructId, "subnet"),
    expectedDataAwsSubnet: "subnet-123456",
    expectedError: false,
  },
  specifyTokenizedSecurityGroup: {
    inputConfig: {
      name: "test-model",
      executionRoleArn: "arn:aws:iam::123456789012:role/SageMakerRole",
      vpcConfig: {
        securityGroupIds: [],
        subnets: ["subnet-123456"],
      },
    },
    inputStackConstructor: (scope, config) => {
      const sg = new SecurityGroup(scope, "sg", {
        name: "test-sg",
        vpcId: "vpc-123456",
      });
      if (config.vpcConfig == null) {
        throw new Error("vpcConfig must be defined");
      }
      new SagemakerModel(scope, constructId, {
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
  specifyNoSubnet: {
    inputConfig: {
      name: "test-model",
      executionRoleArn: "arn:aws:iam::123456789012:role/SageMakerRole",
      vpcConfig: {
        securityGroupIds: ["sg-123456"],
        subnets: [],
      },
    },
    inputStackConstructor: (scope, config) => {
      new SagemakerModel(scope, constructId, config);
    },
    expectedError: true,
  },
} as const;
