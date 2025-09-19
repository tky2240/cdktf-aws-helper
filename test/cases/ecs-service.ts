import { EcsService } from "@cdktf/provider-aws/lib/ecs-service";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "../../src/resources/linkables/ecs-service";
import {
  createSecurityGroupInput,
  createVpcIdString,
  TestSuite,
} from "./suite";

const constructId = "test-ecs-service";

export const ECS_SERVICE_TEST_SUITE: TestSuite<typeof EcsService> = {
  specifySecurityGroup: {
    inputConfig: {
      name: "test-ecs-service",
      networkConfiguration: {
        subnets: ["subnet-123456"],
        securityGroups: ["sg-123456"],
      },
    },
    inputStackConstructor: (scope, config) => {
      new EcsService(scope, constructId, config);
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
      name: "test-ecs-service",
      networkConfiguration: {
        subnets: ["subnet-123456"],
      },
    },
    inputStackConstructor: (scope, config) => {
      new EcsService(scope, constructId, config);
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
      name: "test-ecs-service",
      networkConfiguration: {
        subnets: ["subnet-123456"],
        securityGroups: [],
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
      new EcsService(scope, constructId, {
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
} as const;
