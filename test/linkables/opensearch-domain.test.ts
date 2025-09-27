import { DataAwsSubnet } from "@cdktf/provider-aws/lib/data-aws-subnet";
import { OpensearchDomain } from "@cdktf/provider-aws/lib/opensearch-domain";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "cdktf/lib/testing/adapters/jest";
import "../../src/resources/linkables/opensearch-domain";
import { OPENSEARCH_DOMAIN_TEST_SUITE } from "../cases/opensearch-domain";
import { synthTestStack } from "../synth";

describe("OpensearchDomainNormalTestSuite", () => {
  for (const [name, suite] of Object.entries(OPENSEARCH_DOMAIN_TEST_SUITE)) {
    if (suite.expectedError) {
      continue;
    }
    test(name, () => {
      const synthed = synthTestStack((scope) => {
        suite.inputStackConstructor(scope, suite.inputConfig);
      });
      expect(synthed).toHaveResourceWithProperties(OpensearchDomain, {
        domain_name: suite.inputConfig.domainName,
        cluster_config: {
          instance_type: suite.inputConfig.clusterConfig?.instanceType,
        },
        vpc_options: {
          subnet_ids: suite.inputConfig.vpcOptions?.subnetIds,
          security_group_ids: suite.expectedSecurityGroupIdsString,
        },
      });
      expect(synthed).toHaveResourceWithProperties(SecurityGroup, {
        name: suite.expectedSecurityGroupName,
        vpc_id: suite.expectedVpcIdString,
      });
      expect(synthed).toHaveDataSourceWithProperties(DataAwsSubnet, {
        id: suite.expectedDataAwsSubnet,
      });
    });
  }
});

describe("OpensearchDomainErrorTestSuite", () => {
  for (const [name, suite] of Object.entries(OPENSEARCH_DOMAIN_TEST_SUITE)) {
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
