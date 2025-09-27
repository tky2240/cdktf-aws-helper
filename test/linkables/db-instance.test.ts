import { DataAwsDbSubnetGroup } from "@cdktf/provider-aws/lib/data-aws-db-subnet-group";
import { DbInstance } from "@cdktf/provider-aws/lib/db-instance";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "cdktf/lib/testing/adapters/jest";
import "../../src/resources/linkables/db-instance";
import { DB_INSTANCE_TEST_SUITE } from "../cases/db-instance";
import { synthTestStack } from "../synth";

describe("DbInstanceNormalTestSuite", () => {
  for (const [name, suite] of Object.entries(DB_INSTANCE_TEST_SUITE)) {
    if (suite.expectedError) {
      continue;
    }
    test(name, () => {
      const synthed = synthTestStack((scope) => {
        suite.inputStackConstructor(scope, suite.inputConfig);
      });
      expect(synthed).toHaveResourceWithProperties(DbInstance, {
        identifier: suite.inputConfig.identifier,
        instance_class: suite.inputConfig.instanceClass,
        vpc_security_group_ids: suite.expectedSecurityGroupIdsString,
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

describe("DbInstanceErrorTestSuite", () => {
  for (const [name, suite] of Object.entries(DB_INSTANCE_TEST_SUITE)) {
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
