import { DataAwsSubnet } from "@cdktf/provider-aws/lib/data-aws-subnet";
import { EksCluster } from "@cdktf/provider-aws/lib/eks-cluster";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "cdktf/lib/testing/adapters/jest";
import "../../src/resources/linkables/eks-cluster";
import { EKS_CLUSTER_TEST_SUITE } from "../cases/eks-cluster";
import { synthTestStack } from "../synth";

describe("EksClusterNormalTestSuite", () => {
  for (const [name, suite] of Object.entries(EKS_CLUSTER_TEST_SUITE)) {
    if (suite.expectedError) {
      continue;
    }
    test(name, () => {
      const synthed = synthTestStack((scope) => {
        suite.inputStackConstructor(scope, suite.inputConfig);
      });
      expect(synthed).toHaveResourceWithProperties(EksCluster, {
        name: suite.inputConfig.name,
        role_arn: suite.inputConfig.roleArn,
        vpc_config: {
          subnet_ids: suite.inputConfig.vpcConfig.subnetIds,
          security_group_ids: suite.expectedSecurityGroupIdsString,
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

describe("EksClusterErrorTestSuite", () => {
  for (const [name, suite] of Object.entries(EKS_CLUSTER_TEST_SUITE)) {
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
