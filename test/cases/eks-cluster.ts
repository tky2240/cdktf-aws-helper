import { EksCluster } from "@cdktf/provider-aws/lib/eks-cluster";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "../../src/resources/linkables/eks-cluster";
import {
  createSecurityGroupInput,
  createVpcIdString,
  TestSuite,
} from "./suite";

const constructId = "test-eks-cluster";

export const EKS_CLUSTER_TEST_SUITE: TestSuite<typeof EksCluster> = {
  specifySecurityGroup: {
    inputConfig: {
      name: "test-eks",
      roleArn: "arn:aws:iam::123456789012:role/eksClusterRole",
      vpcConfig: {
        subnetIds: ["subnet-123456"],
        securityGroupIds: ["sg-123456"],
      },
    },
    inputStackConstructor: (scope, config) => {
      new EksCluster(scope, constructId, config);
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
      name: "test-eks",
      roleArn: "arn:aws:iam::123456789012:role/eksClusterRole",
      vpcConfig: {
        subnetIds: ["subnet-123456"],
      },
    },
    inputStackConstructor: (scope, config) => {
      new EksCluster(scope, constructId, config);
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
      name: "test-eks",
      roleArn: "arn:aws:iam::123456789012:role/eksClusterRole",
      vpcConfig: {
        subnetIds: ["subnet-123456"],
        securityGroupIds: [],
      },
    },
    inputStackConstructor: (scope, config) => {
      const sg = new SecurityGroup(scope, "sg", {
        name: "test-sg",
        vpcId: "vpc-123456",
      });
      if (!config.vpcConfig?.subnetIds) {
        throw new Error("subnetIds is undefined");
      }
      new EksCluster(scope, constructId, {
        ...config,
        vpcConfig: {
          ...config.vpcConfig,
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
} as const;
