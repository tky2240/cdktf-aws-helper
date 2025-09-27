import { EcsTaskSet } from "@cdktf/provider-aws/lib/ecs-task-set";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "../../src/resources/linkables/ecs-task-set";
import {
  createSecurityGroupInput,
  createVpcIdString,
  TestSuite,
} from "./suite";

const constructId = "test-ecs-task-set";

export const ECS_TASK_SET_TEST_SUITE: TestSuite<typeof EcsTaskSet> = {
  specifySecurityGroup: {
    inputConfig: {
      cluster: "arn:aws:ecs:us-east-1:123456789012:cluster/test-cluster",
      service: "arn:aws:ecs:us-east-1:123456789012:service/test-service",
      taskDefinition:
        "arn:aws:ecs:us-east-1:123456789012:task-definition/test-task",
      networkConfiguration: {
        subnets: ["subnet-123456"],
        securityGroups: ["sg-123456"],
      },
    },
    inputStackConstructor: (scope, config) => {
      new EcsTaskSet(scope, constructId, config);
    },
    expectedSecurityGroupIdsString: createSecurityGroupInput(constructId, [
      {
        isToken: false,
        value: "sg-123456",
      },
    ]),
    expectedSecurityGroupName: `${constructId}-SG`,
    expectedVpcIdString: createVpcIdString(constructId, "subnet"),
    expectedDataAwsSubnet: "subnet-123456",
    expectedError: false,
  },
  specifyNoSecurityGroup: {
    inputConfig: {
      cluster: "arn:aws:ecs:us-east-1:123456789012:cluster/test-cluster",
      service: "arn:aws:ecs:us-east-1:123456789012:service/test-service",
      taskDefinition:
        "arn:aws:ecs:us-east-1:123456789012:task-definition/test-task",
      networkConfiguration: {
        subnets: ["subnet-123456"],
      },
    },
    inputStackConstructor: (scope, config) => {
      new EcsTaskSet(scope, constructId, config);
    },
    expectedSecurityGroupIdsString: createSecurityGroupInput(
      constructId,
      undefined,
    ),
    expectedSecurityGroupName: `${constructId}-SG`,
    expectedVpcIdString: createVpcIdString(constructId, "subnet"),
    expectedDataAwsSubnet: "subnet-123456",
    expectedError: false,
  },
  specifyTokenizedSecurityGroup: {
    inputConfig: {
      cluster: "arn:aws:ecs:us-east-1:123456789012:cluster/test-cluster",
      service: "arn:aws:ecs:us-east-1:123456789012:service/test-service",
      taskDefinition:
        "arn:aws:ecs:us-east-1:123456789012:task-definition/test-task",
      networkConfiguration: {
        subnets: ["subnet-123456"],
        securityGroups: ["sg-123456"],
      },
    },
    inputStackConstructor: (scope, config) => {
      const sg = new SecurityGroup(scope, "sg", {
        name: "test-sg",
        vpcId: "vpc-123456",
      });
      if (config.networkConfiguration?.subnets == null) {
        throw new Error("subnets is undefined");
      }
      new EcsTaskSet(scope, constructId, {
        ...config,
        networkConfiguration: {
          ...config.networkConfiguration,
          securityGroups: [sg.id],
        },
      });
    },
    expectedSecurityGroupIdsString: createSecurityGroupInput(constructId, [
      { isToken: true, value: "aws_security_group.sg.id" },
    ]),
    expectedSecurityGroupName: `${constructId}-SG`,
    expectedVpcIdString: createVpcIdString(constructId, "subnet"),
    expectedDataAwsSubnet: "subnet-123456",
    expectedError: false,
  },
  specifyNoSubnet: {
    inputConfig: {
      cluster: "arn:aws:ecs:us-east-1:123456789012:cluster/test-cluster",
      service: "arn:aws:ecs:us-east-1:123456789012:service/test-service",
      taskDefinition:
        "arn:aws:ecs:us-east-1:123456789012:task-definition/test-task",
      networkConfiguration: {
        securityGroups: ["sg-123456"],
        subnets: [],
      },
    },
    inputStackConstructor: (scope, config) => {
      new EcsTaskSet(scope, constructId, config);
    },
    expectedError: true,
  },
} as const;
