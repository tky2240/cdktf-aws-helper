import { DataAwsSubnet } from "@cdktf/provider-aws/lib/data-aws-subnet";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { SyntheticsCanary } from "@cdktf/provider-aws/lib/synthetics-canary";
import "cdktf/lib/testing/adapters/jest";
import "../../src/resources/linkables/synthetics-canary";
import { SYNTHETICS_CANARY_TEST_SUITE } from "../cases/synthetics-canary";
import { synthTestStack } from "../synth";

describe("SyntheticsCanaryNormalTestSuite", () => {
  for (const [name, suite] of Object.entries(SYNTHETICS_CANARY_TEST_SUITE)) {
    if (suite.expectedError) {
      continue;
    }
    test(name, () => {
      const synthed = synthTestStack((scope) => {
        suite.inputStackConstructor(scope, suite.inputConfig);
      });
      expect(synthed).toHaveResourceWithProperties(SyntheticsCanary, {
        name: suite.inputConfig.name,
        execution_role_arn: suite.inputConfig.executionRoleArn,
        artifact_s3_location: suite.inputConfig.artifactS3Location,
        handler: suite.inputConfig.handler,
        runtime_version: suite.inputConfig.runtimeVersion,
        schedule: suite.inputConfig.schedule,
        vpc_config: {
          subnet_ids: suite.inputConfig.vpcConfig?.subnetIds,
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

describe("SyntheticsCanaryErrorTestSuite", () => {
  for (const [name, suite] of Object.entries(SYNTHETICS_CANARY_TEST_SUITE)) {
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
