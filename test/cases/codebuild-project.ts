import { CodebuildProject } from "@cdktf/provider-aws/lib/codebuild-project";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "../../src/resources/linkables/codebuild-project";
import { createSecurityGroupInput, TestSuite } from "./suite";

const constructId = "test-environment";

export const CODEBUILD_PROJECT_TEST_SUITE: TestSuite<typeof CodebuildProject> =
  {
    specifySecurityGroup: {
      inputConfig: {
        name: "test-project",
        serviceRole:
          "arn:aws:iam::123456789012:role/service-role/codebuild-service-role",
        artifacts: {
          type: "NO_ARTIFACTS",
        },
        environment: {
          computeType: "BUILD_GENERAL1_SMALL",
          image: "aws/codebuild/standard:5.0",
          type: "LINUX_CONTAINER",
        },
        source: {
          type: "GITHUB",
          location: "https://github.com",
        },
        vpcConfig: {
          vpcId: "vpc-123456",
          subnets: ["subnet-123456"],
          securityGroupIds: ["sg-123456"],
        },
      },
      inputStackConstructor: (scope, config) => {
        new CodebuildProject(scope, constructId, config);
      },
      expectedSecurityGroupIdsString: createSecurityGroupInput(constructId, [
        {
          isToken: false,
          value: "sg-123456",
        },
      ]),
      expectedSecurityGroupName: `${constructId}-SG`,
      expectedVpcIdString: "vpc-123456",
      expectedError: false,
    },
    specifyNoSecurityGroup: {
      inputConfig: {
        name: "test-project",
        serviceRole:
          "arn:aws:iam::123456789012:role/service-role/codebuild-service-role",
        artifacts: {
          type: "NO_ARTIFACTS",
        },
        environment: {
          computeType: "BUILD_GENERAL1_SMALL",
          image: "aws/codebuild/standard:5.0",
          type: "LINUX_CONTAINER",
        },
        source: {
          type: "GITHUB",
          location: "https://github.com",
        },
        vpcConfig: {
          vpcId: "vpc-123456",
          subnets: ["subnet-123456"],
          securityGroupIds: [],
        },
      },
      inputStackConstructor: (scope, config) => {
        new CodebuildProject(scope, constructId, config);
      },
      expectedSecurityGroupIdsString: createSecurityGroupInput(constructId, []),
      expectedSecurityGroupName: `${constructId}-SG`,
      expectedVpcIdString: "vpc-123456",
      expectedError: false,
    },
    specifyTokenizedSecurityGroup: {
      inputConfig: {
        name: "test-project",
        serviceRole:
          "arn:aws:iam::123456789012:role/service-role/codebuild-service-role",
        artifacts: {
          type: "NO_ARTIFACTS",
        },
        environment: {
          computeType: "BUILD_GENERAL1_SMALL",
          image: "aws/codebuild/standard:5.0",
          type: "LINUX_CONTAINER",
        },
        source: {
          type: "GITHUB",
          location: "https://github.com",
        },
        vpcConfig: {
          vpcId: "vpc-123456",
          subnets: ["subnet-123456"],
          securityGroupIds: [],
        },
      },
      inputStackConstructor: (scope, config) => {
        const sg = new SecurityGroup(scope, "sg", {
          name: "test-sg",
          vpcId: "vpc-123456",
        });
        if (config.vpcConfig?.subnets === undefined) {
          throw new Error("vpcConfig.subnets is undefined");
        }
        new CodebuildProject(scope, constructId, {
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
      expectedVpcIdString: "vpc-123456",
      expectedError: false,
    },
  } as const;
