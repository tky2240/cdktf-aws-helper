import { DataAwsDbSubnetGroup } from "@cdktf/provider-aws/lib/data-aws-db-subnet-group";
import { NeptuneCluster } from "@cdktf/provider-aws/lib/neptune-cluster";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "cdktf/lib/testing/adapters/jest";
import "../../src/resources/linkables/msk-cluster";
import { NEPTUNE_CLUSTER_TEST_SUITE } from "../cases/neptune-cluster";
import { synthTestStack } from "../synth";

describe("NeptuneClusterTestSuites", () => {
  for (const [name, suite] of Object.entries(NEPTUNE_CLUSTER_TEST_SUITE)) {
    test(name, () => {
      const synthed = synthTestStack((scope) => {
        suite.inputStackConstructor(scope, suite.inputConfig);
      });
      expect(synthed).toHaveResourceWithProperties(NeptuneCluster, {
        cluster_identifier: suite.inputConfig?.clusterIdentifier,
        engine: suite.inputConfig?.engine,
        neptune_subnet_group_name: suite.inputConfig?.neptuneSubnetGroupName,
        vpc_security_group_ids: suite.expectedSecurityGroupIdsString,
      });
      expect(synthed).toHaveResourceWithProperties(SecurityGroup, {
        name: suite.expectedSecurityGroupName,
        vpc_id: suite.expectedVpcIdString,
      });
      expect(synthed).toHaveDataSourceWithProperties(DataAwsDbSubnetGroup, {
        name: suite.inputConfig?.neptuneSubnetGroupName,
      });
    });
  }
});
