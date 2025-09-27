import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { VpcEndpoint } from "@cdktf/provider-aws/lib/vpc-endpoint";
import "cdktf/lib/testing/adapters/jest";
import "../../src/resources/linkables/vpc-endpoint";
import { VPC_ENDPOINT_TEST_SUITE } from "../cases/vpc-endpoint";
import { synthTestStack } from "../synth";

describe("VPCEndpointNormalTestSuite", () => {
  for (const [name, suite] of Object.entries(VPC_ENDPOINT_TEST_SUITE)) {
    if (suite.expectedError) {
      continue;
    }
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
    });
  }
});

describe("VPCEndpointErrorTestSuite", () => {
  for (const [name, suite] of Object.entries(VPC_ENDPOINT_TEST_SUITE)) {
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
