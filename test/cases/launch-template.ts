import { LaunchTemplate } from "@cdktf/provider-aws/lib/launch-template";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "../../src/resources/linkables/launch-template";
import {
  createSecurityGroupInput,
  createVpcIdString,
  TestSuite,
} from "./suite";

const constructId = "test-launch-template";

export const LAUNCH_TEMPLATE_TEST_SUITE: TestSuite<typeof LaunchTemplate> = {
  specifySecurityGroup: {
    inputConfig: {
      name: "test-launch-template",
      vpcSecurityGroupIds: ["sg-123456"],
    },
    inputStackConstructor: (scope, config) => {
      new LaunchTemplate(scope, constructId, config);
    },
    expectedSecurityGroupIdsString: createSecurityGroupInput(constructId, [
      {
        isToken: false,
        value: "sg-123456",
      },
    ]),
    expectedSecurityGroupName: `${constructId}-SG`,
    expectedVpcIdString: createVpcIdString(constructId, "security-group"),
    expectedDataAwsSubnet: "subnet-123456",
    expectedError: false,
  },
  specifyNoSecurityGroup: {
    inputConfig: {
      name: "test-launch-template",
    },
    inputStackConstructor: (scope, config) => {
      new LaunchTemplate(scope, constructId, config);
    },
    expectedSecurityGroupIdsString: undefined,
    expectedSecurityGroupName: `${constructId}-SG`,
    expectedVpcIdString: createVpcIdString(constructId, "security-group"),
    expectedDataAwsSubnet: "subnet-123456",
    expectedError: false,
  },
  specifyTokenizedSecurityGroup: {
    inputConfig: {
      name: "test-launch-template",
      vpcSecurityGroupIds: [],
    },
    inputStackConstructor: (scope, config) => {
      const sg = new SecurityGroup(scope, "sg", {
        name: "test-sg",
        vpcId: "vpc-123456",
      });
      new LaunchTemplate(scope, constructId, {
        ...config,
        vpcSecurityGroupIds: [`${sg.id}`],
      });
    },
    expectedSecurityGroupIdsString: createSecurityGroupInput(constructId, [
      { isToken: true, value: "aws_security_group.sg.id" },
    ]),
    expectedSecurityGroupName: `${constructId}-SG`,
    expectedVpcIdString: createVpcIdString(constructId, "security-group"),
    expectedDataAwsSubnet: "subnet-123456",
    expectedError: false,
  },
} as const;
