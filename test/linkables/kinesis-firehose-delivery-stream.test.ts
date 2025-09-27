import { DataAwsSubnet } from "@cdktf/provider-aws/lib/data-aws-subnet";
import { KinesisFirehoseDeliveryStream } from "@cdktf/provider-aws/lib/kinesis-firehose-delivery-stream";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "cdktf/lib/testing/adapters/jest";
import "../../src/resources/linkables/kinesis-firehose-delivery-stream";
import { KINESIS_FIREHOSE_DELIVERY_STREAM_TEST_SUITE } from "../cases/kinesis-firehose-delivery-stream";
import { synthTestStack } from "../synth";

describe("KinesisFirehoseDeliveryStreamNormalTestSuite", () => {
  for (const [name, suite] of Object.entries(
    KINESIS_FIREHOSE_DELIVERY_STREAM_TEST_SUITE,
  )) {
    if (suite.expectedError) {
      continue;
    }
    test(name, () => {
      const synthed = synthTestStack((scope) => {
        suite.inputStackConstructor(scope, suite.inputConfig);
      });
      expect(synthed).toHaveResourceWithProperties(
        KinesisFirehoseDeliveryStream,
        {
          name: suite.inputConfig.name,
          destination: suite.inputConfig.destination,
          opensearch_configuration: {
            role_arn: suite.inputConfig.opensearchConfiguration?.roleArn,
            domain_arn: suite.inputConfig.opensearchConfiguration?.domainArn,
            index_name: suite.inputConfig.opensearchConfiguration?.indexName,
            s3_configuration: {
              bucket_arn:
                suite.inputConfig.opensearchConfiguration?.s3Configuration
                  .bucketArn,
              role_arn:
                suite.inputConfig.opensearchConfiguration?.s3Configuration
                  .roleArn,
            },
            vpc_config: {
              subnet_ids:
                suite.inputConfig.opensearchConfiguration?.vpcConfig?.subnetIds,
              security_group_ids: suite.expectedSecurityGroupIdsString,
              role_arn:
                suite.inputConfig.opensearchConfiguration?.vpcConfig?.roleArn,
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

describe("KinesisFirehoseDeliveryStreamErrorTestSuite", () => {
  for (const [name, suite] of Object.entries(
    KINESIS_FIREHOSE_DELIVERY_STREAM_TEST_SUITE,
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
