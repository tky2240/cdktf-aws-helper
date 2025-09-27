import { DataAwsSubnet } from "@cdktf/provider-aws/lib/data-aws-subnet";
import { MskCluster } from "@cdktf/provider-aws/lib/msk-cluster";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "cdktf/lib/testing/adapters/jest";
import "../../src/resources/linkables/msk-cluster";
import { MSK_CLUSTER_TEST_SUITE } from "../cases/msk-cluster";
import { synthTestStack } from "../synth";

describe("MskClusterNormalTestSuite", () => {
  for (const [name, suite] of Object.entries(MSK_CLUSTER_TEST_SUITE)) {
    if (suite.expectedError) {
      continue;
    }
    test(name, () => {
      const synthed = synthTestStack((scope) => {
        suite.inputStackConstructor(scope, suite.inputConfig);
      });
      expect(synthed).toHaveResourceWithProperties(MskCluster, {
        cluster_name: suite.inputConfig?.clusterName,
        kafka_version: suite.inputConfig?.kafkaVersion,
        number_of_broker_nodes: suite.inputConfig?.numberOfBrokerNodes,
        broker_node_group_info: {
          instance_type: suite.inputConfig?.brokerNodeGroupInfo?.instanceType,
          client_subnets: suite.inputConfig?.brokerNodeGroupInfo?.clientSubnets,
          security_groups: suite.expectedSecurityGroupIdsString,
        },
      });
      expect(synthed).toHaveResourceWithProperties(SecurityGroup, {
        name: suite.expectedSecurityGroupName,
        vpc_id: suite.expectedVpcIdString,
      });
      expect(synthed).toHaveDataSourceWithProperties(DataAwsSubnet, {
        id: suite.expectedDataAwsSubnet,
      });
    });
  }
});

describe("MskClusterErrorTestSuite", () => {
  for (const [name, suite] of Object.entries(MSK_CLUSTER_TEST_SUITE)) {
    if (!suite.expectedError) {
      continue;
    }
    test(name, () => {
      expect(() =>
        synthTestStack((scope) => {
          suite.inputStackConstructor(scope, suite.inputConfig);
        }),
      ).toThrow();
    });
  }
});
