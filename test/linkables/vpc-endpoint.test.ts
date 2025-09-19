import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { VpcEndpoint } from "@cdktf/provider-aws/lib/vpc-endpoint";
import "cdktf/lib/testing/adapters/jest";
import "../../src/resources/linkables/vpc-endpoint";
import { VPC_ENDPOINT_TEST_SUITE } from "../cases/vpc-endpoint";
import { synthTestStack } from "../synth";

describe("VPCEndpointTestSuites", () => {
  for (const [name, suite] of Object.entries(VPC_ENDPOINT_TEST_SUITE)) {
    test(name, () => {
      const synthed = synthTestStack((scope) => {
        suite.inputStackConstructor(scope, suite.inputConfig);
      });
      expect(synthed).toHaveResourceWithProperties(VpcEndpoint, {
        vpc_endpoint_type: suite.inputConfig.vpcEndpointType,
        vpc_id: suite.inputConfig.vpcId,
        service_name: suite.inputConfig.serviceName,
        subnet_ids: suite.inputConfig.subnetIds,
        security_group_ids: suite.expectedSecurityGroupIdsString,
      });
      expect(synthed).toHaveResourceWithProperties(SecurityGroup, {
        name: suite.expectedSecurityGroupName,
        vpc_id: suite.expectedVpcIdString,
      });
      // expect(synthed).toHaveDataSourceWithProperties(DataAwsSubnet, {
      //   id: suite.expectedDataAwsSubnet,
      // });
    });
  }
});
