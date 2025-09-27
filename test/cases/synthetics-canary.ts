import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { SyntheticsCanary } from "@cdktf/provider-aws/lib/synthetics-canary";
import "../../src/resources/linkables/synthetics-canary";
import {
  createSecurityGroupInput,
  createVpcIdString,
  TestSuite,
} from "./suite";

const constructId = "test-synthetics-canary";

export const SYNTHETICS_CANARY_TEST_SUITE: TestSuite<typeof SyntheticsCanary> =
  {
    specifySecurityGroup: {
      inputConfig: {
        name: "test-canary",
        artifactS3Location: "s3://my-canary-artifacts/",
        handler: "index.handler",
        runtimeVersion: "syn-nodejs-2.0",
        schedule: { expression: "rate(5 minutes)" },
        executionRoleArn: "arn:aws:iam::123456789012:role/CanaryRole",
        vpcConfig: {
          securityGroupIds: ["sg-123456"],
          subnetIds: ["subnet-123456"],
        },
      },
      inputStackConstructor: (scope, config) => {
        new SyntheticsCanary(scope, constructId, config);
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
        name: "test-canary",
        artifactS3Location: "s3://my-canary-artifacts/",
        handler: "index.handler",
        runtimeVersion: "syn-nodejs-2.0",
        schedule: { expression: "rate(5 minutes)" },
        executionRoleArn: "arn:aws:iam::123456789012:role/CanaryRole",
        vpcConfig: {
          subnetIds: ["subnet-123456"],
        },
      },
      inputStackConstructor: (scope, config) => {
        new SyntheticsCanary(scope, constructId, config);
      },
      expectedSecurityGroupIdsString: createSecurityGroupInput(
        constructId,
        undefined,
      ),
      expectedSecurityGroupName: `${constructId}-SG`,
      expectedVpcIdString: createVpcIdString(constructId, "subnet"),
      expectedDataAwsSubnet: "subnet-123456",
      expectedError: false,
    },
    specifyTokenizedSecurityGroup: {
      inputConfig: {
        name: "test-canary",
        artifactS3Location: "s3://my-canary-artifacts/",
        handler: "index.handler",
        runtimeVersion: "syn-nodejs-2.0",
        schedule: { expression: "rate(5 minutes)" },
        executionRoleArn: "arn:aws:iam::123456789012:role/CanaryRole",
        vpcConfig: {
          securityGroupIds: [],
          subnetIds: ["subnet-123456"],
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
        new SyntheticsCanary(scope, constructId, {
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
        name: "test-canary",
        artifactS3Location: "s3://my-canary-artifacts/",
        handler: "index.handler",
        runtimeVersion: "syn-nodejs-2.0",
        schedule: { expression: "rate(5 minutes)" },
        executionRoleArn: "arn:aws:iam::123456789012:role/CanaryRole",
        vpcConfig: {
          securityGroupIds: ["sg-123456"],
        },
      },
      inputStackConstructor: (scope, config) => {
        new SyntheticsCanary(scope, constructId, config);
      },
      expectedError: true,
    },
  } as const;
