import { DataAwsSubnet } from "@cdktf/provider-aws/lib/data-aws-subnet";
import { DbProxy } from "@cdktf/provider-aws/lib/db-proxy";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "cdktf/lib/testing/adapters/jest";
import "../../src/resources/linkables/db-proxy";
import { DB_PROXY_TEST_SUITE } from "../cases/db-proxy";
import { synthTestStack } from "../synth";

describe("DbProxyNormalTestSuite", () => {
  for (const [name, suite] of Object.entries(DB_PROXY_TEST_SUITE)) {
    if (suite.expectedError) {
      continue;
    }
    test(name, () => {
      const synthed = synthTestStack((scope) => {
        suite.inputStackConstructor(scope, suite.inputConfig);
      });
      expect(synthed).toHaveResourceWithProperties(DbProxy, {
        name: suite.inputConfig.name,
        auth: [
          {
            auth_scheme: Array.isArray(suite.inputConfig.auth)
              ? suite.inputConfig.auth[0].authScheme
              : undefined,
            secret_arn: Array.isArray(suite.inputConfig.auth)
              ? suite.inputConfig.auth[0].secretArn
              : undefined,
            iam_auth: Array.isArray(suite.inputConfig.auth)
              ? suite.inputConfig.auth[0].iamAuth
              : undefined,
          },
        ],
        engine_family: suite.inputConfig.engineFamily,
        role_arn: suite.inputConfig.roleArn,
        vpc_subnet_ids: suite.inputConfig.vpcSubnetIds,
        vpc_security_group_ids: suite.expectedSecurityGroupIdsString,
      });
      expect(synthed).toHaveResourceWithProperties(SecurityGroup, {
        name: suite.expectedSecurityGroupName,
        vpc_id: suite.expectedVpcIdString,
      });
      expect(synthed).toHaveDataSourceWithProperties(DataAwsSubnet, {
        id: suite.inputConfig.vpcSubnetIds[0],
      });
    });
  }
});

describe("DbProxyErrorTestSuite", () => {
  for (const [name, suite] of Object.entries(DB_PROXY_TEST_SUITE)) {
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
