import { DataAwsDbSubnetGroup } from "@cdktf/provider-aws/lib/data-aws-db-subnet-group";
import { RdsCluster } from "@cdktf/provider-aws/lib/rds-cluster";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "cdktf/lib/testing/adapters/jest";
import "../../src/resources/linkables/rds-cluster";
import { RDS_CLUSTER_TEST_SUITE } from "../cases/rds-cluster";
import { synthTestStack } from "../synth";

describe("RDSClusterTestSuites", () => {
  for (const [name, suite] of Object.entries(RDS_CLUSTER_TEST_SUITE)) {
    test(name, () => {
      const synthed = synthTestStack((scope) => {
        suite.inputStackConstructor(scope, suite.inputConfig);
      });
      expect(synthed).toHaveResourceWithProperties(RdsCluster, {
        cluster_identifier: suite.inputConfig?.clusterIdentifier,
        engine: suite.inputConfig?.engine,
        db_subnet_group_name: suite.inputConfig?.dbSubnetGroupName,
        vpc_security_group_ids: suite.expectedSecurityGroupIdsString,
      });
      expect(synthed).toHaveResourceWithProperties(SecurityGroup, {
        name: suite.expectedSecurityGroupName,
        vpc_id: suite.expectedVpcIdString,
      });
      expect(synthed).toHaveDataSourceWithProperties(DataAwsDbSubnetGroup, {
        name: suite.inputConfig?.dbSubnetGroupName,
      });
    });
  }
});
