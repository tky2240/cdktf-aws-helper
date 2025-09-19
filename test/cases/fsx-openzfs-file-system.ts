import { FsxOpenzfsFileSystem } from "@cdktf/provider-aws/lib/fsx-openzfs-file-system";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "../../src/resources/linkables/fsx-openzfs-file-system";
import {
  createSecurityGroupInput,
  createVpcIdString,
  TestSuite,
} from "./suite";

const constructId = "test-fsx-openzfs-file-system";

export const FSX_OPENZFS_FILE_SYSTEM_TEST_SUITE: TestSuite<
  typeof FsxOpenzfsFileSystem
> = {
  specifySecurityGroup: {
    inputConfig: {
      deploymentType: "MULTI_AZ_1",
      preferredSubnetId: "subnet-123456",
      throughputCapacity: 64,
      subnetIds: ["subnet-123456"],
      securityGroupIds: ["sg-123456"],
    },
    inputStackConstructor: (scope, config) => {
      new FsxOpenzfsFileSystem(scope, constructId, config);
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
      deploymentType: "MULTI_AZ_1",
      preferredSubnetId: "subnet-123456",
      throughputCapacity: 64,
      subnetIds: ["subnet-123456"],
    },
    inputStackConstructor: (scope, config) => {
      new FsxOpenzfsFileSystem(scope, constructId, config);
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
      deploymentType: "MULTI_AZ_1",
      preferredSubnetId: "subnet-123456",
      throughputCapacity: 64,
      subnetIds: ["subnet-123456"],
      securityGroupIds: [],
    },
    inputStackConstructor: (scope, config) => {
      const sg = new SecurityGroup(scope, "sg", {
        name: "test-sg",
        vpcId: "vpc-123456",
      });
      if (!config.subnetIds) {
        throw new Error("subnetIds is undefined");
      }
      new FsxOpenzfsFileSystem(scope, constructId, {
        ...config,
        securityGroupIds: [sg.id],
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
