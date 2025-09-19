import { Lb } from "@cdktf/provider-aws/lib/lb";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "../../src/resources/linkables/lb";
import {
  createSecurityGroupInput,
  createVpcIdString,
  TestSuite,
} from "./suite";

const constructId = "test-lb";

export const LB_TEST_SUITE: TestSuite<typeof Lb> = {
  specifySecurityGroup: {
    inputConfig: {
      name: "test-lb",
      internal: false,
      loadBalancerType: "application",
      securityGroups: ["sg-123456"],
      subnets: ["subnet-123456"],
    },
    inputStackConstructor: (scope, config) => {
      new Lb(scope, constructId, config);
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
      name: "test-lb",
      internal: false,
      loadBalancerType: "application",
      securityGroups: [],
      subnets: ["subnet-123456"],
    },
    inputStackConstructor: (scope, config) => {
      new Lb(scope, constructId, config);
    },
    expectedSecurityGroupIdsString: createSecurityGroupInput(constructId, []),
    expectedSecurityGroupName: `${constructId}-SG`,
    expectedVpcIdString: createVpcIdString(constructId, "subnet"),
    expectedDataAwsSubnet: "subnet-123456",
    expectedError: false,
  },
  specifyTokenizedSecurityGroup: {
    inputConfig: {
      name: "test-lb",
      internal: false,
      loadBalancerType: "application",
      securityGroups: [],
      subnets: ["subnet-123456"],
    },
    inputStackConstructor: (scope, config) => {
      const sg = new SecurityGroup(scope, "sg", {
        name: "test-sg",
        vpcId: "vpc-123456",
      });
      new Lb(scope, constructId, {
        ...config,
        securityGroups: [sg.id],
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
} as const;
