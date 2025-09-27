import { FsxWindowsFileSystem } from "@cdktf/provider-aws/lib/fsx-windows-file-system";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "../../src/resources/linkables/fsx-windows-file-system";
import {
  createSecurityGroupInput,
  createVpcIdString,
  TestSuite,
} from "./suite";

const constructId = "test-fsx-windows-file-system";

export const FSX_WINDOWS_FILE_SYSTEM_TEST_SUITE: TestSuite<
  typeof FsxWindowsFileSystem
> = {
  specifySecurityGroup: {
    inputConfig: {
      throughputCapacity: 64,
      subnetIds: ["subnet-123456"],
      securityGroupIds: ["sg-123456"],
    },
    inputStackConstructor: (scope, config) => {
      new FsxWindowsFileSystem(scope, constructId, config);
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
      throughputCapacity: 64,
      subnetIds: ["subnet-123456"],
    },
    inputStackConstructor: (scope, config) => {
      new FsxWindowsFileSystem(scope, constructId, config);
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
      new FsxWindowsFileSystem(scope, constructId, {
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
  specifyNoSubnet: {
    inputConfig: {
      throughputCapacity: 64,
      subnetIds: [],
      securityGroupIds: ["sg-123456"],
    },
    inputStackConstructor: (scope, config) => {
      new FsxWindowsFileSystem(scope, constructId, config);
    },
    expectedError: true,
  },
} as const;
