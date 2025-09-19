import { RdsCluster } from "@cdktf/provider-aws/lib/rds-cluster";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "../../src/resources/linkables/rds-cluster";
import {
  createSecurityGroupInput,
  createVpcIdString,
  TestSuite,
} from "./suite";

const constructId = "test-rds-cluster";

export const RDS_CLUSTER_TEST_SUITE: TestSuite<typeof RdsCluster> = {
  specifySecurityGroup: {
    inputConfig: {
      clusterIdentifier: "test-rds-cluster",
      engine: "aurora-mysql",
      vpcSecurityGroupIds: ["sg-123456"],
      dbSubnetGroupName: "test-subnet-group",
    },
    inputStackConstructor: (scope, config) => {
      new RdsCluster(scope, constructId, config);
    },
    expectedSecurityGroupIdsString: createSecurityGroupInput(constructId, [
      {
        isToken: false,
        value: "sg-123456",
      },
    ]),
    expectedSecurityGroupName: `${constructId}-SG`,
    expectedVpcIdString: createVpcIdString(constructId, "db-subnet-group"),
    expectedDataAwsSubnet: "subnet-123456",
    expectedError: false,
  },
  specifyNoSecurityGroup: {
    inputConfig: {
      clusterIdentifier: "test-rds-cluster",
      engine: "aurora-mysql",
      vpcSecurityGroupIds: [],
      dbSubnetGroupName: "test-subnet-group",
    },
    inputStackConstructor: (scope, config) => {
      new RdsCluster(scope, constructId, config);
    },
    expectedSecurityGroupIdsString: createSecurityGroupInput(constructId, []),
    expectedSecurityGroupName: `${constructId}-SG`,
    expectedVpcIdString: createVpcIdString(constructId, "db-subnet-group"),
    expectedDataAwsSubnet: "subnet-123456",
    expectedError: false,
  },
  specifyTokenizedSecurityGroup: {
    inputConfig: {
      clusterIdentifier: "test-rds-cluster",
      engine: "aurora-mysql",
      vpcSecurityGroupIds: [],
      dbSubnetGroupName: "test-subnet-group",
    },
    inputStackConstructor: (scope, config) => {
      const sg = new SecurityGroup(scope, "sg", {
        name: "test-sg",
        vpcId: "vpc-123456",
      });
      new RdsCluster(scope, constructId, {
        ...config,
        vpcSecurityGroupIds: [sg.id],
      });
    },
    expectedSecurityGroupIdsString: createSecurityGroupInput(constructId, [
      { isToken: true, value: "aws_security_group.sg.id" },
    ]),
    expectedSecurityGroupName: `${constructId}-SG`,
    expectedVpcIdString: createVpcIdString(constructId, "db-subnet-group"),
    expectedDataAwsSubnet: "subnet-123456",
    expectedError: false,
  },
} as const;
