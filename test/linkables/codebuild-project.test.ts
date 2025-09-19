import { CodebuildProject } from "@cdktf/provider-aws/lib/codebuild-project";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "cdktf/lib/testing/adapters/jest";
import "../../src/resources/linkables/codebuild-project";
import { CODEBUILD_PROJECT_TEST_SUITE } from "../cases/codebuild-project";
import { synthTestStack } from "../synth";

describe("CodebuildProjectTestSuite", () => {
  for (const [name, suite] of Object.entries(CODEBUILD_PROJECT_TEST_SUITE)) {
    test(name, () => {
      const synthed = synthTestStack((scope) => {
        suite.inputStackConstructor(scope, suite.inputConfig);
      });
      expect(synthed).toHaveResourceWithProperties(CodebuildProject, {
        name: suite.inputConfig.name,
        service_role: suite.inputConfig.serviceRole,
        artifacts: suite.inputConfig.artifacts,
        environment: {
          compute_type: suite.inputConfig.environment.computeType,
          image: suite.inputConfig.environment.image,
          type: suite.inputConfig.environment.type,
        },
        source: suite.inputConfig.source,
        vpc_config: {
          vpc_id: suite.inputConfig.vpcConfig?.vpcId,
          subnets: suite.inputConfig.vpcConfig?.subnets,
          security_group_ids: suite.expectedSecurityGroupIdsString,
        },
      });
      expect(synthed).toHaveResourceWithProperties(SecurityGroup, {
        name: suite.expectedSecurityGroupName,
        vpc_id: suite.expectedVpcIdString,
      });
    });
  }
});
