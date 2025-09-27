import { LaunchTemplate } from "@cdktf/provider-aws/lib/launch-template";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "cdktf/lib/testing/adapters/jest";
import "../../src/resources/linkables/launch-template";
import { LAUNCH_TEMPLATE_TEST_SUITE } from "../cases/launch-template";
import { synthTestStack } from "../synth";

describe("LaunchTemplateNormalTestSuite", () => {
  for (const [name, suite] of Object.entries(LAUNCH_TEMPLATE_TEST_SUITE)) {
    if (suite.expectedError) {
      continue;
    }
    test(name, () => {
      const synthed = synthTestStack((scope) => {
        suite.inputStackConstructor(scope, suite.inputConfig);
      });
      expect(synthed).toHaveResourceWithProperties(
        LaunchTemplate,
        (() => {
          if (suite.inputConfig?.vpcSecurityGroupIds == null) {
            return { name: suite.inputConfig?.name };
          } else {
            return {
              name: suite.inputConfig?.name,
              vpc_security_group_ids: suite.expectedSecurityGroupIdsString,
            };
          }
        })(),
      );
      if (suite.inputConfig?.vpcSecurityGroupIds != null) {
        expect(synthed).toHaveResourceWithProperties(SecurityGroup, {
          name: suite.expectedSecurityGroupName,
          vpc_id: suite.expectedVpcIdString,
        });
      }
    });
  }
});

describe("LaunchTemplateErrorTestSuite", () => {
  for (const [name, suite] of Object.entries(LAUNCH_TEMPLATE_TEST_SUITE)) {
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
