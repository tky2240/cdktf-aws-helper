import { DataAwsSubnet } from "@cdktf/provider-aws/lib/data-aws-subnet";
import { EcsService } from "@cdktf/provider-aws/lib/ecs-service";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "cdktf/lib/testing/adapters/jest";
import "../../src/resources/linkables/ecs-service";
import { ECS_SERVICE_TEST_SUITE } from "../cases/ecs-service";
import { synthTestStack } from "../synth";

describe("EcsServiceNormalTestSuite", () => {
  for (const [name, suite] of Object.entries(ECS_SERVICE_TEST_SUITE)) {
    test(name, () => {
      if (suite.expectedError) {
        return;
      }
      const synthed = synthTestStack((scope) => {
        suite.inputStackConstructor(scope, suite.inputConfig);
      });
      if (suite.inputConfig == null) {
        throw new Error("inputConfig is null");
      }
      expect(synthed).toHaveResourceWithProperties(EcsService, {
        name: suite.inputConfig.name,
        network_configuration: {
          subnets: suite.inputConfig.networkConfiguration?.subnets,
          security_groups: suite.expectedSecurityGroupIdsString,
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

describe("EcsServiceErrorTestSuite", () => {
  for (const [name, suite] of Object.entries(ECS_SERVICE_TEST_SUITE)) {
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
