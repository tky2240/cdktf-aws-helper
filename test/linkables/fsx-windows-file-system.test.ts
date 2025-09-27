import { DataAwsSubnet } from "@cdktf/provider-aws/lib/data-aws-subnet";
import { FsxWindowsFileSystem } from "@cdktf/provider-aws/lib/fsx-windows-file-system";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "cdktf/lib/testing/adapters/jest";
import "../../src/resources/linkables/fsx-windows-file-system";
import { FSX_WINDOWS_FILE_SYSTEM_TEST_SUITE } from "../cases/fsx-windows-file-system";
import { synthTestStack } from "../synth";

describe("FsxWindowsFileSystemNormalTestSuite", () => {
  for (const [name, suite] of Object.entries(
    FSX_WINDOWS_FILE_SYSTEM_TEST_SUITE,
  )) {
    if (suite.expectedError) {
      continue;
    }
    test(name, () => {
      const synthed = synthTestStack((scope) => {
        suite.inputStackConstructor(scope, suite.inputConfig);
      });
      expect(synthed).toHaveResourceWithProperties(FsxWindowsFileSystem, {
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

describe("FsxWindowsFileSystemErrorTestSuite", () => {
  for (const [name, suite] of Object.entries(
    FSX_WINDOWS_FILE_SYSTEM_TEST_SUITE,
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
