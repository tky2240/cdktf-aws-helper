import { MskCluster } from "@cdktf/provider-aws/lib/msk-cluster";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "../../src/resources/linkables/msk-cluster";
import {
  createSecurityGroupInput,
  createVpcIdString,
  TestSuite,
} from "./suite";

const constructId = "test-msk-cluster";

export const MSK_CLUSTER_TEST_SUITE: TestSuite<typeof MskCluster> = {
  specifySecurityGroup: {
    inputConfig: {
      clusterName: "test-msk-cluster",
      kafkaVersion: "2.8.0",
      numberOfBrokerNodes: 3,
      brokerNodeGroupInfo: {
        instanceType: "kafka.m5.large",
        clientSubnets: ["subnet-123456"],
        securityGroups: ["sg-123456"],
      },
    },
    inputStackConstructor: (scope, config) => {
      new MskCluster(scope, constructId, config);
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
      clusterName: "test-msk-cluster",
      kafkaVersion: "2.8.0",
      numberOfBrokerNodes: 3,
      brokerNodeGroupInfo: {
        instanceType: "kafka.m5.large",
        clientSubnets: ["subnet-123456"],
        securityGroups: [],
      },
    },
    inputStackConstructor: (scope, config) => {
      new MskCluster(scope, constructId, config);
    },
    expectedSecurityGroupIdsString: createSecurityGroupInput(constructId, []),
    expectedSecurityGroupName: `${constructId}-SG`,
    expectedVpcIdString: createVpcIdString(constructId, "subnet"),
    expectedDataAwsSubnet: "subnet-123456",
    expectedError: false,
  },
  specifyTokenizedSecurityGroup: {
    inputConfig: {
      clusterName: "test-msk-cluster",
      kafkaVersion: "2.8.0",
      numberOfBrokerNodes: 3,
      brokerNodeGroupInfo: {
        instanceType: "kafka.m5.large",
        clientSubnets: ["subnet-123456"],
        securityGroups: [],
      },
    },
    inputStackConstructor: (scope, config) => {
      const sg = new SecurityGroup(scope, "sg", {
        name: "test-sg",
        vpcId: "vpc-123456",
      });
      new MskCluster(scope, constructId, {
        ...config,
        brokerNodeGroupInfo: {
          ...config.brokerNodeGroupInfo,
          securityGroups: [sg.id],
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
} as const;
