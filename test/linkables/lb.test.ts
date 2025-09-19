import { DataAwsSubnet } from "@cdktf/provider-aws/lib/data-aws-subnet";
import { Lb } from "@cdktf/provider-aws/lib/lb";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "cdktf/lib/testing/adapters/jest";
import "../../src/resources/linkables/lb";
import { LB_TEST_SUITE } from "../cases/lb";
import { synthTestStack } from "../synth";

describe("LBTestSuites", () => {
  for (const [name, suite] of Object.entries(LB_TEST_SUITE)) {
    test(name, () => {
      const synthed = synthTestStack((scope) => {
        suite.inputStackConstructor(scope, suite.inputConfig);
      });
      expect(synthed).toHaveResourceWithProperties(Lb, {
        name: suite.inputConfig?.name,
        internal: suite.inputConfig?.internal,
        load_balancer_type: suite.inputConfig?.loadBalancerType,
        security_groups: suite.expectedSecurityGroupIdsString,
        subnets: suite.inputConfig?.subnets,
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
