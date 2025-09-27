import { DataAwsRedshiftSubnetGroup } from "@cdktf/provider-aws/lib/data-aws-redshift-subnet-group";
import { RedshiftCluster } from "@cdktf/provider-aws/lib/redshift-cluster";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "cdktf/lib/testing/adapters/jest";
import "../../src/resources/linkables/redshift-cluster";
import { REDSHIFT_CLUSTER_TEST_SUITE } from "../cases/redshift-cluster";
import { synthTestStack } from "../synth";

describe("RedshiftClusterNormalTestSuite", () => {
  for (const [name, suite] of Object.entries(REDSHIFT_CLUSTER_TEST_SUITE)) {
    if (suite.expectedError) {
      continue;
    }
    test(name, () => {
      const synthed = synthTestStack((scope) => {
        suite.inputStackConstructor(scope, suite.inputConfig);
      });
      expect(synthed).toHaveResourceWithProperties(RedshiftCluster, {
        cluster_identifier: suite.inputConfig?.clusterIdentifier,
        node_type: suite.inputConfig?.nodeType,
        master_username: suite.inputConfig?.masterUsername,
        master_password: suite.inputConfig?.masterPassword,
        cluster_subnet_group_name: suite.inputConfig?.clusterSubnetGroupName,
        vpc_security_group_ids: suite.expectedSecurityGroupIdsString,
      });
      expect(synthed).toHaveResourceWithProperties(SecurityGroup, {
        name: suite.expectedSecurityGroupName,
        vpc_id: suite.expectedVpcIdString,
      });
      expect(synthed).toHaveDataSourceWithProperties(
        DataAwsRedshiftSubnetGroup,
        {
          name: suite.inputConfig?.clusterSubnetGroupName,
        },
      );
    });
  }
});

describe("RedshiftClusterErrorTestSuite", () => {
  for (const [name, suite] of Object.entries(REDSHIFT_CLUSTER_TEST_SUITE)) {
    if (!suite.expectedError) {
      continue;
    }
    test(name, () => {
      expect(() =>
        synthTestStack((scope) => {
          suite.inputStackConstructor(scope, suite.inputConfig);
        }),
      ).toThrow();
    });
  }
});
