import { FsxFileCache } from "@cdktf/provider-aws/lib/fsx-file-cache";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "../../src/resources/linkables/fsx-file-cache";
import {
  createSecurityGroupInput,
  createVpcIdString,
  TestSuite,
} from "./suite";

const constructId = "test-fsx-file-cache";

export const FSX_FILE_CACHE_TEST_SUITE: TestSuite<typeof FsxFileCache> = {
  specifySecurityGroup: {
    inputConfig: {
      fileCacheType: "LUSTRE",
      fileCacheTypeVersion: "2.12",
      storageCapacity: 1200,
      subnetIds: ["subnet-123456"],
      securityGroupIds: ["sg-123456"],
    },
    inputStackConstructor: (scope, config) => {
      new FsxFileCache(scope, constructId, config);
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
      fileCacheType: "LUSTRE",
      fileCacheTypeVersion: "2.12",
      storageCapacity: 1200,
      subnetIds: ["subnet-123456"],
    },
    inputStackConstructor: (scope, config) => {
      new FsxFileCache(scope, constructId, config);
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
      fileCacheType: "LUSTRE",
      fileCacheTypeVersion: "2.12",
      storageCapacity: 1200,
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
      new FsxFileCache(scope, constructId, {
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
