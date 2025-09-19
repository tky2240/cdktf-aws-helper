import { KinesisFirehoseDeliveryStream } from "@cdktf/provider-aws/lib/kinesis-firehose-delivery-stream";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "../../src/resources/linkables/kinesis-firehose-delivery-stream";
import {
  createSecurityGroupInput,
  createVpcIdString,
  TestSuite,
} from "./suite";

const constructId = "test-kinesis-firehose-delivery-stream";

export const KINESIS_FIREHOSE_DELIVERY_STREAM_TEST_SUITE: TestSuite<
  typeof KinesisFirehoseDeliveryStream
> = {
  specifySecurityGroup: {
    inputConfig: {
      name: "test-firehose",
      destination: "opensearch",
      opensearchConfiguration: {
        roleArn: "arn:aws:iam::123456789012:role/firehose_role",
        domainArn: "arn:aws:es:us-west-2:123456789012:domain/test-domain",
        indexName: "test-index",
        s3Configuration: {
          roleArn: "arn:aws:iam::123456789012:role/firehose_role",
          bucketArn: "arn:aws:s3:::test-bucket",
        },
        vpcConfig: {
          subnetIds: ["subnet-123456"],
          securityGroupIds: ["sg-123456"],
          roleArn: "arn:aws:iam::123456789012:role/firehose_role",
        },
      },
    },
    inputStackConstructor: (scope, config) => {
      new KinesisFirehoseDeliveryStream(scope, constructId, config);
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
      name: "test-firehose",
      destination: "opensearch",
      opensearchConfiguration: {
        roleArn: "arn:aws:iam::123456789012:role/firehose_role",
        domainArn: "arn:aws:es:us-west-2:123456789012:domain/test-domain",
        indexName: "test-index",
        s3Configuration: {
          roleArn: "arn:aws:iam::123456789012:role/firehose_role",
          bucketArn: "arn:aws:s3:::test-bucket",
        },
        vpcConfig: {
          subnetIds: ["subnet-123456"],
          securityGroupIds: [],
          roleArn: "arn:aws:iam::123456789012:role/firehose_role",
        },
      },
    },
    inputStackConstructor: (scope, config) => {
      new KinesisFirehoseDeliveryStream(scope, constructId, config);
    },
    expectedSecurityGroupIdsString: createSecurityGroupInput(constructId, []),
    expectedSecurityGroupName: `${constructId}-SG`,
    expectedVpcIdString: createVpcIdString(constructId, "subnet"),
    expectedDataAwsSubnet: "subnet-123456",
    expectedError: false,
  },
  specifyTokenizedSecurityGroup: {
    inputConfig: {
      name: "test-firehose",
      destination: "opensearch",
      opensearchConfiguration: {
        roleArn: "arn:aws:iam::123456789012:role/firehose_role",
        domainArn: "arn:aws:es:us-west-2:123456789012:domain/test-domain",
        indexName: "test-index",
        s3Configuration: {
          roleArn: "arn:aws:iam::123456789012:role/firehose_role",
          bucketArn: "arn:aws:s3:::test-bucket",
        },
        vpcConfig: {
          subnetIds: ["subnet-123456"],
          securityGroupIds: [],
          roleArn: "arn:aws:iam::123456789012:role/firehose_role",
        },
      },
    },
    inputStackConstructor: (scope, config) => {
      const sg = new SecurityGroup(scope, "sg", {
        name: "test-sg",
        vpcId: "vpc-123456",
      });
      if (!config.opensearchConfiguration?.vpcConfig?.roleArn) {
        throw new Error("roleArn is undefined");
      }
      new KinesisFirehoseDeliveryStream(scope, constructId, {
        ...config,
        opensearchConfiguration: {
          ...config?.opensearchConfiguration,
          vpcConfig: {
            ...config?.opensearchConfiguration?.vpcConfig,
            securityGroupIds: [sg.id],
          },
        },
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
