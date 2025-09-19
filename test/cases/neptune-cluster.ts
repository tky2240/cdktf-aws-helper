import { NeptuneCluster } from "@cdktf/provider-aws/lib/neptune-cluster";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "../../src/resources/linkables/neptune-cluster";
import {
  createSecurityGroupInput,
  createVpcIdString,
  TestSuite,
} from "./suite";

const constructId = "test-neptune-cluster";

export const NEPTUNE_CLUSTER_TEST_SUITE: TestSuite<typeof NeptuneCluster> = {
  specifySecurityGroup: {
    inputConfig: {
      clusterIdentifier: "test-neptune-cluster",
      engine: "neptune",
      vpcSecurityGroupIds: ["sg-123456"],
      neptuneSubnetGroupName: "test-subnet-group",
    },
    inputStackConstructor: (scope, config) => {
      new NeptuneCluster(scope, constructId, config);
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
      clusterIdentifier: "test-neptune-cluster",
      engine: "neptune",
      vpcSecurityGroupIds: [],
      neptuneSubnetGroupName: "test-subnet-group",
    },
    inputStackConstructor: (scope, config) => {
      new NeptuneCluster(scope, constructId, config);
    },
    expectedSecurityGroupIdsString: createSecurityGroupInput(constructId, []),
    expectedSecurityGroupName: `${constructId}-SG`,
    expectedVpcIdString: createVpcIdString(constructId, "db-subnet-group"),
    expectedDataAwsSubnet: "subnet-123456",
    expectedError: false,
  },
  specifyTokenizedSecurityGroup: {
    inputConfig: {
      clusterIdentifier: "test-neptune-cluster",
      engine: "neptune",
      vpcSecurityGroupIds: [],
      neptuneSubnetGroupName: "test-subnet-group",
    },
    inputStackConstructor: (scope, config) => {
      const sg = new SecurityGroup(scope, "sg", {
        name: "test-sg",
        vpcId: "vpc-123456",
      });
      new NeptuneCluster(scope, constructId, {
        ...config,
        vpcSecurityGroupIds: [sg.id],
      });
    },
    expectedSecurityGroupIdsString: createSecurityGroupInput(constructId, [
      { isToken: true, value: "aws_security_group.sg.id" },
    ]),
    expectedSecurityGroupName: `${constructId}-SG`,
    expectedVpcIdString: createVpcIdString(constructId, "db-subnet-group"),
    expectedDataAwsSubnet: "db-subnet-group",
    expectedError: false,
  },
} as const;
