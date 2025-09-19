import { DataAwsSubnet } from "@cdktf/provider-aws/lib/data-aws-subnet";
import { EcsTaskSet } from "@cdktf/provider-aws/lib/ecs-task-set";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "cdktf/lib/testing/adapters/jest";
import "../../src/resources/linkables/ecs-task-set";
import { ECS_TASK_SET_TEST_SUITE } from "../cases/ecs-task-set";
import { synthTestStack } from "../synth";

describe("EcsTaskSetTestSuites", () => {
  for (const [name, suite] of Object.entries(ECS_TASK_SET_TEST_SUITE)) {
    test(name, () => {
      const synthed = synthTestStack((scope) => {
        suite.inputStackConstructor(scope, suite.inputConfig);
      });
      expect(synthed).toHaveResourceWithProperties(EcsTaskSet, {
        cluster: suite.inputConfig.cluster,
        service: suite.inputConfig.service,
        task_definition: suite.inputConfig.taskDefinition,
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
