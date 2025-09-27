import { DataAwsSubnet } from "@cdktf/provider-aws/lib/data-aws-subnet";
import { Instance } from "@cdktf/provider-aws/lib/instance";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "cdktf/lib/testing/adapters/jest";
import "../../src/resources/linkables/instance";
import { INSTANCE_TEST_SUITE } from "../cases/instance";
import { synthTestStack } from "../synth";

describe("InstanceTestNormalSuite", () => {
  for (const [name, suite] of Object.entries(INSTANCE_TEST_SUITE)) {
    if (suite.expectedError) {
      continue;
    }
    test(name, () => {
      const synthed = synthTestStack((scope) => {
        suite.inputStackConstructor(scope, suite.inputConfig);
      });
      expect(synthed).toHaveResourceWithProperties(Instance, {
        ami: suite.inputConfig?.ami,
        instance_type: suite.inputConfig?.instanceType,
        subnet_id: suite.inputConfig?.subnetId,
        vpc_security_group_ids: suite.expectedSecurityGroupIdsString,
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

describe("InstanceTestErrorSuite", () => {
  for (const [name, suite] of Object.entries(INSTANCE_TEST_SUITE)) {
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
