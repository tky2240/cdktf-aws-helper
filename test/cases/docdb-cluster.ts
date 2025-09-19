import { DocdbCluster } from "@cdktf/provider-aws/lib/docdb-cluster";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "../../src/resources/linkables/docdb-cluster";
import {
  createSecurityGroupInput,
  createVpcIdString,
  TestSuite,
} from "./suite";

const constructId = "test-docdb-cluster";

export const DOCDB_CLUSTER_TEST_SUITE: TestSuite<typeof DocdbCluster> = {
  specifySecurityGroup: {
    inputConfig: {
      clusterIdentifier: "test-docdb-cluster",
      masterUsername: "admin",
      masterPassword: "password123",
      vpcSecurityGroupIds: ["sg-123456"],
      dbSubnetGroupName: "test-subnet-group",
      engine: "docdb",
    },
    inputStackConstructor: (scope, config) => {
      new DocdbCluster(scope, constructId, config);
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
      clusterIdentifier: "test-docdb-cluster",
      masterUsername: "admin",
      masterPassword: "password123",
      dbSubnetGroupName: "test-subnet-group",
      engine: "docdb",
    },
    inputStackConstructor: (scope, config) => {
      new DocdbCluster(scope, constructId, config);
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
      clusterIdentifier: "test-docdb-cluster",
      masterUsername: "admin",
      masterPassword: "password123",
      vpcSecurityGroupIds: [],
      dbSubnetGroupName: "test-subnet-group",
      engine: "docdb",
    },
    inputStackConstructor: (scope, config) => {
      const sg = new SecurityGroup(scope, "sg", {
        name: "test-sg",
        vpcId: "vpc-123456",
      });
      new DocdbCluster(scope, constructId, {
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
