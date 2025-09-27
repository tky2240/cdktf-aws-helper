import { DataAwsSubnet } from "@cdktf/provider-aws/lib/data-aws-subnet";
import { FsxLustreFileSystem } from "@cdktf/provider-aws/lib/fsx-lustre-file-system";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "cdktf/lib/testing/adapters/jest";
import "../../src/resources/linkables/fsx-lustre-file-system";
import { FSX_LUSTRE_FILE_SYSTEM_TEST_SUITE } from "../cases/fsx-lustre-file-system";
import { synthTestStack } from "../synth";

describe("FsxLustreFileSystemNormalTestSuite", () => {
  for (const [name, suite] of Object.entries(
    FSX_LUSTRE_FILE_SYSTEM_TEST_SUITE,
  )) {
    if (suite.expectedError) {
      continue;
    }
    test(name, () => {
      const synthed = synthTestStack((scope) => {
        suite.inputStackConstructor(scope, suite.inputConfig);
      });
      expect(synthed).toHaveResourceWithProperties(FsxLustreFileSystem, {
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

describe("FsxLustreFileSystemErrorTestSuite", () => {
  for (const [name, suite] of Object.entries(
    FSX_LUSTRE_FILE_SYSTEM_TEST_SUITE,
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
