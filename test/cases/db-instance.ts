import { DbInstance } from "@cdktf/provider-aws/lib/db-instance";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "../../src/resources/linkables/db-instance";
import {
  createSecurityGroupInput,
  createVpcIdString,
  TestSuite,
} from "./suite";

const constructId = "test-db-instance";

export const DB_INSTANCE_TEST_SUITE: TestSuite<typeof DbInstance> = {
  specifySecurityGroup: {
    inputConfig: {
      identifier: "test-db-instance",
      instanceClass: "db.t3.micro",
      dbSubnetGroupName: "test-subnet-group",
      vpcSecurityGroupIds: ["sg-123456"],
    },
    inputStackConstructor: (scope, config) => {
      new DbInstance(scope, constructId, config);
    },
    expectedSecurityGroupIdsString: createSecurityGroupInput(constructId, [
      {
        isToken: false,
        value: "sg-123456",
      },
    ]),
    expectedSecurityGroupName: `${constructId}-SG`,
    expectedVpcIdString: createVpcIdString(constructId, "db-subnet-group"),
    expectedError: false,
  },
  specifyNoSecurityGroup: {
    inputConfig: {
      identifier: "test-db-instance",
      instanceClass: "db.t3.micro",
      dbSubnetGroupName: "test-subnet-group",
    },
    inputStackConstructor: (scope, config) => {
      new DbInstance(scope, constructId, config);
    },
    expectedSecurityGroupIdsString: createSecurityGroupInput(
      constructId,
      undefined,
    ),
    expectedSecurityGroupName: `${constructId}-SG`,
    expectedVpcIdString: createVpcIdString(constructId, "db-subnet-group"),
    expectedError: false,
  },
  specifyTokenizedSecurityGroup: {
    inputConfig: {
      identifier: "test-db-instance",
      instanceClass: "db.t3.micro",
      dbSubnetGroupName: "test-subnet-group",
      vpcSecurityGroupIds: [],
    },
    inputStackConstructor: (scope, config) => {
      const sg = new SecurityGroup(scope, "sg", {
        name: "test-sg",
        vpcId: "vpc-123456",
      });
      if (config.dbSubnetGroupName === undefined) {
        throw new Error("dbSubnetGroupName is undefined");
      }
      new DbInstance(scope, constructId, {
        ...config,
        vpcSecurityGroupIds: [sg.id],
      });
    },
    expectedSecurityGroupIdsString: createSecurityGroupInput(constructId, [
      { isToken: true, value: "aws_security_group.sg.id" },
    ]),
    expectedSecurityGroupName: `${constructId}-SG`,
    expectedVpcIdString: createVpcIdString(constructId, "db-subnet-group"),
    expectedError: false,
  },
} as const;
