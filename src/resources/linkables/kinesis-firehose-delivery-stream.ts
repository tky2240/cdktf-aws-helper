import { DataAwsSubnet } from "@cdktf/provider-aws/lib/data-aws-subnet";
import { KinesisFirehoseDeliveryStream } from "@cdktf/provider-aws/lib/kinesis-firehose-delivery-stream";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { Fn } from "cdktf";
import { Construct } from "constructs";
import { ILinkable, Linkage } from "../../linkage";

declare module "@cdktf/provider-aws/lib/kinesis-firehose-delivery-stream" {
  interface KinesisFirehoseDeliveryStream extends ILinkable {}
}

const OriginalKinesisFirehoseDeliveryStream = KinesisFirehoseDeliveryStream;

//@ts-expect-error override constructor
KinesisFirehoseDeliveryStream = function (
  ...args: [scope: Construct, id: string, config: any]
): KinesisFirehoseDeliveryStream {
  const stream = Reflect.construct(
    OriginalKinesisFirehoseDeliveryStream,
    args,
  ) as KinesisFirehoseDeliveryStream;
  const scope = stream.node.scope;
  if (!scope) {
    throw new Error("Kinesis Firehose Delivery Stream must have a scope");
  }
  Object.defineProperty(stream, "linkage", {
    get() {
      //@ts-expect-error check vpc association
      if (stream._linkage == null) {
        throw new Error("This Stream is not associated with a VPC");
      }
      //@ts-expect-error return private field
      return stream._linkage;
    },
  });
  if (stream.elasticsearchConfigurationInput != null) {
    const subnetId =
      stream.elasticsearchConfiguration.vpcConfig.subnetIdsInput?.[0];
    if (subnetId == null) {
      throw new Error("Subnet ID must be specified");
    }
    const sg = new SecurityGroup(scope, `${stream.node.id}-SG`, {
      name: `${stream.node.id}-SG`,
      description: `Security group for ${stream.node.id}`,
      vpcId: new DataAwsSubnet(scope, `${stream.node.id}-SubnetData`, {
        id: subnetId,
      }).vpcId,
    });
    stream.elasticsearchConfiguration.vpcConfig.securityGroupIds = Fn.flatten([
      [stream.elasticsearchConfiguration.vpcConfig.securityGroupIdsInput],
      sg.id,
    ]);
    Object.defineProperty(stream, "_linkage", {
      value: new Linkage(scope, `${stream.node.id}-Linkage`, {
        peer: sg,
      }),
    });
  }
  if (stream.opensearchConfigurationInput != null) {
    const subnetId =
      stream.opensearchConfiguration.vpcConfig.subnetIdsInput?.[0];
    if (subnetId == null) {
      throw new Error("Subnet ID must be specified");
    }
    const sg = new SecurityGroup(scope, `${stream.node.id}-SG`, {
      name: `${stream.node.id}-SG`,
      description: `Security group for ${stream.node.id}`,
      vpcId: new DataAwsSubnet(scope, `${stream.node.id}-SubnetData`, {
        id: subnetId,
      }).vpcId,
    });
    stream.opensearchConfiguration.vpcConfig.securityGroupIds = Fn.flatten([
      [stream.opensearchConfiguration.vpcConfig.securityGroupIdsInput],
      sg.id,
    ]);
    Object.defineProperty(stream, "_linkage", {
      value: new Linkage(scope, `${stream.node.id}-Linkage`, {
        peer: sg,
      }),
    });
  }
  if (stream.opensearchserverlessConfigurationInput != null) {
    const subnetId =
      stream.opensearchserverlessConfiguration.vpcConfig.subnetIdsInput?.[0];
    if (subnetId == null) {
      throw new Error("Subnet ID must be specified");
    }
    const sg = new SecurityGroup(scope, `${stream.node.id}-SG`, {
      name: `${stream.node.id}-SG`,
      description: `Security group for ${stream.node.id}`,
      vpcId: new DataAwsSubnet(scope, `${stream.node.id}-SubnetData`, {
        id: subnetId,
      }).vpcId,
    });
    stream.opensearchserverlessConfiguration.vpcConfig.securityGroupIds =
      Fn.flatten([
        [
          stream.opensearchserverlessConfiguration.vpcConfig
            .securityGroupIdsInput,
        ],
        sg.id,
      ]);
    Object.defineProperty(stream, "_linkage", {
      value: new Linkage(scope, `${stream.node.id}-Linkage`, {
        peer: sg,
      }),
    });
  }
  return stream;
};

Object.setPrototypeOf(
  KinesisFirehoseDeliveryStream,
  OriginalKinesisFirehoseDeliveryStream,
);
