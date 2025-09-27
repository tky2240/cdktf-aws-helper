import { ApprunnerVpcConnector } from "@cdktf/provider-aws/lib/apprunner-vpc-connector";
import { DataAwsSubnet } from "@cdktf/provider-aws/lib/data-aws-subnet";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "cdktf/lib/testing/adapters/jest";
import "../../src/resources/linkables/apprunner-vpc-connector";
import { APPRUNNER_VPC_CONNECTOR_TEST_SUITE } from "../cases/apprunner-vpc-connector";
import { synthTestStack } from "../synth";

describe("ApprunnerNormalTestSuite", () => {
  for (const [name, testCase] of Object.entries(
    APPRUNNER_VPC_CONNECTOR_TEST_SUITE,
  )) {
    if (testCase.expectedError) {
      continue;
    }
    test(name, () => {
      const synthed = synthTestStack((scope) => {
        testCase.inputStackConstructor(scope, testCase.inputConfig);
      });
      expect(synthed).toHaveResourceWithProperties(ApprunnerVpcConnector, {
        vpc_connector_name: testCase.inputConfig.vpcConnectorName,
        subnets: testCase.inputConfig.subnets,
        security_groups: testCase.expectedSecurityGroupIdsString,
      });
      expect(synthed).toHaveResourceWithProperties(SecurityGroup, {
        name: testCase.expectedSecurityGroupName,
        vpc_id: testCase.expectedVpcIdString,
      });
      expect(synthed).toHaveDataSourceWithProperties(DataAwsSubnet, {
        id: testCase.expectedDataAwsSubnet,
      });
    });
  }
});

describe("ApprunnerErrorTestSuite", () => {
  for (const [name, testCase] of Object.entries(
    APPRUNNER_VPC_CONNECTOR_TEST_SUITE,
  )) {
    if (!testCase.expectedError) {
      continue;
    }
    test(name, () => {
      expect(() =>
        synthTestStack((scope) => {
          testCase.inputStackConstructor(scope, testCase.inputConfig);
        }),
      ).toThrow();
    });
  }
});
