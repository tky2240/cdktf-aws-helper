import { DataAwsSubnet } from "@cdktf/provider-aws/lib/data-aws-subnet";
import { SagemakerModel } from "@cdktf/provider-aws/lib/sagemaker-model";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "cdktf/lib/testing/adapters/jest";
import "../../src/resources/linkables/sagemaker-model";
import { SAGEMAKER_MODEL_TEST_SUITE } from "../cases/sagemaker-model";
import { synthTestStack } from "../synth";

describe("SagemakerModelNormalTestSuite", () => {
  for (const [name, suite] of Object.entries(SAGEMAKER_MODEL_TEST_SUITE)) {
    if (suite.expectedError) {
      continue;
    }
    test(name, () => {
      const synthed = synthTestStack((scope) => {
        suite.inputStackConstructor(scope, suite.inputConfig);
      });
      expect(synthed).toHaveResourceWithProperties(SagemakerModel, {
        name: suite.inputConfig.name,
        execution_role_arn: suite.inputConfig.executionRoleArn,
        vpc_config: {
          subnets: suite.inputConfig.vpcConfig?.subnets,
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

describe("SagemakerModelErrorTestSuite", () => {
  for (const [name, suite] of Object.entries(SAGEMAKER_MODEL_TEST_SUITE)) {
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
