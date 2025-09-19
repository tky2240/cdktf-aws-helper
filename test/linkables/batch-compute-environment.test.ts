import { BatchComputeEnvironment } from "@cdktf/provider-aws/lib/batch-compute-environment";
import { DataAwsSubnet } from "@cdktf/provider-aws/lib/data-aws-subnet";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "cdktf/lib/testing/adapters/jest";
import "../../src/resources/linkables/batch-compute-environment";
import { BATCH_COMPUTE_ENVIRONMENT_TEST_SUITE } from "../cases/batch-compute-environments";
import { synthTestStack } from "../synth";

describe("BatchComputeEnvironmentTestSuites", () => {
  for (const [name, suite] of Object.entries(
    BATCH_COMPUTE_ENVIRONMENT_TEST_SUITE,
  )) {
    test(name, () => {
      const synthed = synthTestStack((scope) => {
        suite.inputStackConstructor(scope, suite.inputConfig);
      });
      expect(synthed).toHaveResourceWithProperties(BatchComputeEnvironment, {
        type: suite.inputConfig.type,
        compute_resources: {
          type: suite.inputConfig.computeResources?.type,
          max_vcpus: suite.inputConfig.computeResources?.maxVcpus,
          min_vcpus: suite.inputConfig.computeResources?.minVcpus,
          desired_vcpus: suite.inputConfig.computeResources?.desiredVcpus,
          subnets: suite.inputConfig.computeResources?.subnets,
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
