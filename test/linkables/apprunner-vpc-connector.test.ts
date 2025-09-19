import { ApprunnerVpcConnector } from "@cdktf/provider-aws/lib/apprunner-vpc-connector";
import { DataAwsSubnet } from "@cdktf/provider-aws/lib/data-aws-subnet";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "cdktf/lib/testing/adapters/jest";
import "../../src/resources/linkables/apprunner-vpc-connector";
import { APPRUNNER_VPC_CONNECTOR_TEST_SUITE } from "../cases/apprunner-vpc-connector";
import { synthTestStack } from "../synth";

describe("ApprunnerTestSuites", () => {
  for (const [name, suite] of Object.entries(
    APPRUNNER_VPC_CONNECTOR_TEST_SUITE,
  )) {
    test(name, () => {
      const synthed = synthTestStack((scope) => {
        suite.inputStackConstructor(scope, suite.inputConfig);
      });
      expect(synthed).toHaveResourceWithProperties(ApprunnerVpcConnector, {
        vpc_connector_name: suite.inputConfig.vpcConnectorName,
        subnets: suite.inputConfig.subnets,
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
