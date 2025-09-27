import { DataAwsSubnet } from "@cdktf/provider-aws/lib/data-aws-subnet";
import { Kinesisanalyticsv2Application } from "@cdktf/provider-aws/lib/kinesisanalyticsv2-application";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "cdktf/lib/testing/adapters/jest";
import "../../src/resources/linkables/kinesisanalyticsv2-application";
import { KINESISANALYTICSV2_APPLICATION_TEST_SUITE } from "../cases/kinesisanalyticsv2-application";
import { synthTestStack } from "../synth";

describe("KinesisAnalyticsV2ApplicationNormalTestSuite", () => {
  for (const [name, suite] of Object.entries(
    KINESISANALYTICSV2_APPLICATION_TEST_SUITE,
  )) {
    if (suite.expectedError) {
      continue;
    }
    test(name, () => {
      const synthed = synthTestStack((scope) => {
        suite.inputStackConstructor(scope, suite.inputConfig);
      });
      expect(synthed).toHaveResourceWithProperties(
        Kinesisanalyticsv2Application,
        {
          name: suite.inputConfig.name,
          runtime_environment: suite.inputConfig.runtimeEnvironment,
          service_execution_role: suite.inputConfig.serviceExecutionRole,
          application_configuration: {
            application_code_configuration: {
              code_content: {
                text_content:
                  suite.inputConfig.applicationConfiguration
                    ?.applicationCodeConfiguration.codeContent?.textContent,
              },
              code_content_type:
                suite.inputConfig.applicationConfiguration
                  ?.applicationCodeConfiguration.codeContentType,
            },
            vpc_configuration: {
              subnet_ids:
                suite.inputConfig.applicationConfiguration?.vpcConfiguration
                  ?.subnetIds,
              security_group_ids: suite.expectedSecurityGroupIdsString,
            },
          },
        },
      );
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

describe("KinesisAnalyticsV2ApplicationErrorTestSuite", () => {
  for (const [name, suite] of Object.entries(
    KINESISANALYTICSV2_APPLICATION_TEST_SUITE,
  )) {
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
