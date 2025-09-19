import { RedshiftCluster } from "@cdktf/provider-aws/lib/redshift-cluster";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "../../src/resources/linkables/redshift-cluster";
import {
  createSecurityGroupInput,
  createVpcIdString,
  TestSuite,
} from "./suite";

const constructId = "test-redshift-cluster";

export const REDSHIFT_CLUSTER_TEST_SUITE: TestSuite<typeof RedshiftCluster> = {
  specifySecurityGroup: {
    inputConfig: {
      clusterIdentifier: "test-redshift-cluster",
      nodeType: "dc2.large",
      masterUsername: "admin",
      masterPassword: "password",
      vpcSecurityGroupIds: ["sg-123456"],
      clusterSubnetGroupName: "test-subnet-group",
    },
    inputStackConstructor: (scope, config) => {
      new RedshiftCluster(scope, constructId, config);
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
      clusterIdentifier: "test-redshift-cluster",
      nodeType: "dc2.large",
      masterUsername: "admin",
      masterPassword: "password",
      clusterSubnetGroupName: "test-subnet-group",
    },
    inputStackConstructor: (scope, config) => {
      new RedshiftCluster(scope, constructId, config);
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
      clusterIdentifier: "test-redshift-cluster",
      nodeType: "dc2.large",
      masterUsername: "admin",
      masterPassword: "password",
      vpcSecurityGroupIds: [],
      clusterSubnetGroupName: "test-subnet-group",
    },
    inputStackConstructor: (scope, config) => {
      const sg = new SecurityGroup(scope, "sg", {
        name: "test-sg",
        vpcId: "vpc-123456",
      });
      new RedshiftCluster(scope, constructId, {
        ...config,
        vpcSecurityGroupIds: [sg.id],
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
