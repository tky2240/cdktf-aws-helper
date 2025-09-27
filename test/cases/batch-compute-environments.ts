import { BatchComputeEnvironment } from "@cdktf/provider-aws/lib/batch-compute-environment";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "../../src/resources/linkables/batch-compute-environment";
import {
  createSecurityGroupInput,
  createVpcIdString,
  TestSuite,
} from "./suite";

const constructId = "test-environment";

export const BATCH_COMPUTE_ENVIRONMENT_TEST_SUITE: TestSuite<
  typeof BatchComputeEnvironment
> = {
  specifySecurityGroup: {
    inputConfig: {
      type: "MANAGED",
      computeResources: {
        type: "EC2",
        maxVcpus: 16,
        minVcpus: 0,
        desiredVcpus: 8,
        subnets: ["subnet-123456"],
        securityGroupIds: ["sg-123456"],
      },
    },
    inputStackConstructor: (scope, config) => {
      new BatchComputeEnvironment(scope, constructId, config);
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
      type: "MANAGED",
      computeResources: {
        type: "EC2",
        maxVcpus: 16,
        minVcpus: 0,
        desiredVcpus: 8,
        subnets: ["subnet-123456"],
      },
    },
    inputStackConstructor: (scope, config) => {
      new BatchComputeEnvironment(scope, constructId, config);
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
      type: "MANAGED",
      computeResources: {
        type: "EC2",
        maxVcpus: 16,
        minVcpus: 0,
        desiredVcpus: 8,
        subnets: ["subnet-123456"],
      },
    },
    inputStackConstructor: (scope, config) => {
      const sg = new SecurityGroup(scope, "sg", {
        name: "test-sg",
        vpcId: "vpc-123456",
      });
      if (config.computeResources?.maxVcpus === undefined) {
        throw new Error("computeResources.maxVcpus is undefined");
      }
      new BatchComputeEnvironment(scope, constructId, {
        ...config,
        computeResources: {
          ...config.computeResources,
          securityGroupIds: [sg.id],
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
      type: "MANAGED",
      computeResources: {
        type: "EC2",
        maxVcpus: 16,
        minVcpus: 0,
        desiredVcpus: 8,
        securityGroupIds: ["sg-123456"],
        subnets: [],
      },
    },
    inputStackConstructor: (scope, config) => {
      new BatchComputeEnvironment(scope, constructId, config);
    },
    expectedError: true,
  },
} as const;
