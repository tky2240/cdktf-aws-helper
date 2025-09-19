import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { VpcEndpoint } from "@cdktf/provider-aws/lib/vpc-endpoint";
import "../../src/resources/linkables/vpc-endpoint";
import { createSecurityGroupInput, TestSuite } from "./suite";

const constructId = "test-vpc-endpoint";

export const VPC_ENDPOINT_TEST_SUITE: TestSuite<typeof VpcEndpoint> = {
  specifySecurityGroup: {
    inputConfig: {
      vpcEndpointType: "Interface",
      vpcId: "vpc-123456",
      serviceName: "com.amazonaws.region.s3",
      securityGroupIds: ["sg-123456"],
      subnetIds: ["subnet-123456"],
    },
    inputStackConstructor: (scope, config) => {
      new VpcEndpoint(scope, constructId, config);
    },
    expectedSecurityGroupIdsString: createSecurityGroupInput(constructId, [
      {
        isToken: false,
        value: "sg-123456",
      },
    ]),
    expectedSecurityGroupName: `${constructId}-SG`,
    expectedVpcIdString: "vpc-123456",
    expectedDataAwsSubnet: "subnet-123456",
    expectedError: false,
  },
  specifyNoSecurityGroup: {
    inputConfig: {
      vpcEndpointType: "Interface",
      vpcId: "vpc-123456",
      serviceName: "com.amazonaws.region.s3",
      subnetIds: ["subnet-123456"],
    },
    inputStackConstructor: (scope, config) => {
      new VpcEndpoint(scope, constructId, config);
    },
    expectedSecurityGroupIdsString: createSecurityGroupInput(
      constructId,
      undefined,
    ),
    expectedSecurityGroupName: `${constructId}-SG`,
    expectedVpcIdString: "vpc-123456",
    expectedDataAwsSubnet: "subnet-123456",
    expectedError: false,
  },
  specifyTokenizedSecurityGroup: {
    inputConfig: {
      vpcEndpointType: "Interface",
      vpcId: "vpc-123456",
      serviceName: "com.amazonaws.region.s3",
      securityGroupIds: [],
      subnetIds: ["subnet-123456"],
    },
    inputStackConstructor: (scope, config) => {
      const sg = new SecurityGroup(scope, "sg", {
        name: "test-sg",
        vpcId: "vpc-123456",
      });
      if (config.securityGroupIds == null) {
        throw new Error("securityGroupIds must be defined");
      }
      new VpcEndpoint(scope, constructId, {
        ...config,
        securityGroupIds: [sg.id],
      });
    },
    expectedSecurityGroupIdsString: createSecurityGroupInput(constructId, [
      { isToken: true, value: "aws_security_group.sg.id" },
    ]),
    expectedSecurityGroupName: `${constructId}-SG`,
    expectedVpcIdString: "vpc-123456",
    expectedDataAwsSubnet: "subnet-123456",
    expectedError: false,
  },
} as const;
