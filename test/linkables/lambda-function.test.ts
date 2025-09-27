import { DataAwsSubnet } from "@cdktf/provider-aws/lib/data-aws-subnet";
import { LambdaFunction } from "@cdktf/provider-aws/lib/lambda-function";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "cdktf/lib/testing/adapters/jest";
import "../../src/resources/linkables/lambda-function";
import { LAMBDA_FUNCTION_TEST_SUITE } from "../cases/lambda-function";
import { synthTestStack } from "../synth";

describe("LambdaFunctionNormalTestSuite", () => {
  for (const [name, suite] of Object.entries(LAMBDA_FUNCTION_TEST_SUITE)) {
    if (suite.expectedError) {
      continue;
    }
    test(name, () => {
      const synthed = synthTestStack((scope) => {
        suite.inputStackConstructor(scope, suite.inputConfig);
      });
      expect(synthed).toHaveResourceWithProperties(LambdaFunction, {
        function_name: suite.inputConfig.functionName,
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

describe("LambdaFunctionErrorTestSuite", () => {
  for (const [name, suite] of Object.entries(LAMBDA_FUNCTION_TEST_SUITE)) {
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
