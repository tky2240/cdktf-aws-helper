import { ApprunnerVpcConnector } from "@cdktf/provider-aws/lib/apprunner-vpc-connector";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "../../src/resources/linkables/apprunner-vpc-connector";
import {
  createSecurityGroupInput,
  createVpcIdString,
  TestSuite,
} from "./suite";

const constructId = "test-connector";

export const APPRUNNER_VPC_CONNECTOR_TEST_SUITE: TestSuite<
  typeof ApprunnerVpcConnector
> = {
  specifySecurityGroup: {
    inputConfig: {
      vpcConnectorName: "test-connector",
      subnets: ["subnet-123456"],
      securityGroups: ["sg-123456"],
    },
    inputStackConstructor: (scope, config) => {
      new ApprunnerVpcConnector(scope, constructId, config);
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
      vpcConnectorName: "test-connector",
      subnets: ["subnet-123456"],
      securityGroups: [],
    },
    inputStackConstructor: (scope, config) => {
      new ApprunnerVpcConnector(scope, constructId, config);
    },
    expectedSecurityGroupIdsString: createSecurityGroupInput(constructId, []),
    expectedSecurityGroupName: `${constructId}-SG`,
    expectedVpcIdString: createVpcIdString(constructId, "subnet"),
    expectedDataAwsSubnet: "subnet-123456",
    expectedError: false,
  },
  specifyTokenizedSecurityGroup: {
    inputConfig: {
      vpcConnectorName: "test-connector",
      subnets: ["subnet-123456"],
      securityGroups: [],
    },
    inputStackConstructor: (scope, config) => {
      const sg = new SecurityGroup(scope, "sg", {
        name: "test-sg",
        vpcId: "vpc-123456",
      });
      new ApprunnerVpcConnector(scope, constructId, {
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
