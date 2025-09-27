import { DataAwsSubnet } from "@cdktf/provider-aws/lib/data-aws-subnet";
import { FsxOntapFileSystem } from "@cdktf/provider-aws/lib/fsx-ontap-file-system";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "cdktf/lib/testing/adapters/jest";
import "../../src/resources/linkables/fsx-ontap-file-system";
import { FSX_ONTAP_FILE_SYSTEM_TEST_SUITE } from "../cases/fsx-ontap-file-system";
import { synthTestStack } from "../synth";

describe("FsxOntapFileSystemNormalTestSuite", () => {
  for (const [name, suite] of Object.entries(
    FSX_ONTAP_FILE_SYSTEM_TEST_SUITE,
  )) {
    if (suite.expectedError) {
      continue;
    }
    test(name, () => {
      const synthed = synthTestStack((scope) => {
        suite.inputStackConstructor(scope, suite.inputConfig);
      });
      expect(synthed).toHaveResourceWithProperties(FsxOntapFileSystem, {
        deployment_type: suite.inputConfig.deploymentType,
        preferred_subnet_id: suite.inputConfig.preferredSubnetId,
        storage_capacity: suite.inputConfig.storageCapacity,
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

describe("FsxOntapFileSystemErrorTestSuite", () => {
  for (const [name, suite] of Object.entries(
    FSX_ONTAP_FILE_SYSTEM_TEST_SUITE,
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
