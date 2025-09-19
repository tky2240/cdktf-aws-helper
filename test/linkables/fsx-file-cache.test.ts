import { DataAwsSubnet } from "@cdktf/provider-aws/lib/data-aws-subnet";
import { FsxFileCache } from "@cdktf/provider-aws/lib/fsx-file-cache";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "cdktf/lib/testing/adapters/jest";
import "../../src/resources/linkables/fsx-file-cache";
import { FSX_FILE_CACHE_TEST_SUITE } from "../cases/fsx-file-cache";
import { synthTestStack } from "../synth";

describe("FsxFileCacheTestSuites", () => {
  for (const [name, suite] of Object.entries(FSX_FILE_CACHE_TEST_SUITE)) {
    test(name, () => {
      const synthed = synthTestStack((scope) => {
        suite.inputStackConstructor(scope, suite.inputConfig);
      });
      expect(synthed).toHaveResourceWithProperties(FsxFileCache, {
        file_cache_type: suite.inputConfig.fileCacheType,
        file_cache_type_version: suite.inputConfig.fileCacheTypeVersion,
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
