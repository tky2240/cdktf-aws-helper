import { DataAwsSubnet } from "@cdktf/provider-aws/lib/data-aws-subnet";
import { FsxOpenzfsFileSystem } from "@cdktf/provider-aws/lib/fsx-openzfs-file-system";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "cdktf/lib/testing/adapters/jest";
import "../../src/resources/linkables/fsx-openzfs-file-system";
import { FSX_OPENZFS_FILE_SYSTEM_TEST_SUITE } from "../cases/fsx-openzfs-file-system";
import { synthTestStack } from "../synth";

describe("FsxOpenzfsFileSystemNormalTestSuite", () => {
  for (const [name, suite] of Object.entries(
    FSX_OPENZFS_FILE_SYSTEM_TEST_SUITE,
  )) {
    test(name, () => {
      if (suite.expectedError) {
        return;
      }
      const synthed = synthTestStack((scope) => {
        suite.inputStackConstructor(scope, suite.inputConfig);
      });
      expect(synthed).toHaveResourceWithProperties(FsxOpenzfsFileSystem, {
        deployment_type: suite.inputConfig.deploymentType,
        preferred_subnet_id: suite.inputConfig.preferredSubnetId,
        throughput_capacity: suite.inputConfig.throughputCapacity,
        subnet_ids: suite.inputConfig.subnetIds,
        security_group_ids: suite.expectedSecurityGroupIdsString,
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

describe("FsxOpenzfsFileSystemErrorTestSuite", () => {
  for (const [name, suite] of Object.entries(
    FSX_OPENZFS_FILE_SYSTEM_TEST_SUITE,
  )) {
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
