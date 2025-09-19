import { FsxOntapFileSystem } from "@cdktf/provider-aws/lib/fsx-ontap-file-system";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "../../src/resources/linkables/fsx-ontap-file-system";
import {
  createSecurityGroupInput,
  createVpcIdString,
  TestSuite,
} from "./suite";

const constructId = "test-fsx-ontap-file-system";

export const FSX_ONTAP_FILE_SYSTEM_TEST_SUITE: TestSuite<
  typeof FsxOntapFileSystem
> = {
  specifySecurityGroup: {
    inputConfig: {
      deploymentType: "MULTI_AZ_1",
      preferredSubnetId: "subnet-123456",
      storageCapacity: 1024,
      subnetIds: ["subnet-123456"],
      securityGroupIds: ["sg-123456"],
    },
    inputStackConstructor: (scope, config) => {
      new FsxOntapFileSystem(scope, constructId, config);
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
      storageCapacity: 1024,
      subnetIds: ["subnet-123456"],
    },
    inputStackConstructor: (scope, config) => {
      new FsxOntapFileSystem(scope, constructId, config);
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
      storageCapacity: 1024,
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
      new FsxOntapFileSystem(scope, constructId, {
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
