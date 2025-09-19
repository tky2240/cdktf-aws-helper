import { DataAwsSubnet } from "@cdktf/provider-aws/lib/data-aws-subnet";
import { EfsMountTarget } from "@cdktf/provider-aws/lib/efs-mount-target";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "cdktf/lib/testing/adapters/jest";
import "../../src/resources/linkables/efs-mount-target";
import { EFS_MOUNT_TARGET_TEST_SUITE } from "../cases/efs-mount-target";
import { synthTestStack } from "../synth";

describe("EfsMountTargetTestSuites", () => {
  for (const [name, suite] of Object.entries(EFS_MOUNT_TARGET_TEST_SUITE)) {
    test(name, () => {
      const synthed = synthTestStack((scope) => {
        suite.inputStackConstructor(scope, suite.inputConfig);
      });
      expect(synthed).toHaveResourceWithProperties(EfsMountTarget, {
        file_system_id: suite.inputConfig.fileSystemId,
        subnet_id: suite.inputConfig.subnetId,
        security_groups: suite.expectedSecurityGroupIdsString,
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
