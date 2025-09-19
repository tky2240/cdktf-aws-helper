import { DataAwsDbSubnetGroup } from "@cdktf/provider-aws/lib/data-aws-db-subnet-group";
import { DocdbCluster } from "@cdktf/provider-aws/lib/docdb-cluster";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "cdktf/lib/testing/adapters/jest";
import "../../src/resources/linkables/docdb-cluster";
import { DOCDB_CLUSTER_TEST_SUITE } from "../cases/docdb-cluster";
import { synthTestStack } from "../synth";

describe("DocdbClusterTestSuites", () => {
  for (const [name, suite] of Object.entries(DOCDB_CLUSTER_TEST_SUITE)) {
    test(name, () => {
      const synthed = synthTestStack((scope) => {
        suite.inputStackConstructor(scope, suite.inputConfig);
      });
      if (suite.inputConfig == null) {
        throw new Error("inputConfig is null");
      }
      expect(synthed).toHaveResourceWithProperties(DocdbCluster, {
        cluster_identifier: suite.inputConfig.clusterIdentifier,
        master_username: suite.inputConfig.masterUsername,
        master_password: suite.inputConfig.masterPassword,
        vpc_security_group_ids: suite.expectedSecurityGroupIdsString,
        db_subnet_group_name: suite.inputConfig.dbSubnetGroupName,
        engine: suite.inputConfig.engine,
      });
      expect(synthed).toHaveResourceWithProperties(SecurityGroup, {
        name: suite.expectedSecurityGroupName,
        vpc_id: suite.expectedVpcIdString,
      });
      expect(synthed).toHaveDataSourceWithProperties(DataAwsDbSubnetGroup, {
        name: suite.inputConfig.dbSubnetGroupName,
      });
    });
  }
});
