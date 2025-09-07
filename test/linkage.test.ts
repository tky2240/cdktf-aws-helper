import { DataAwsEc2ManagedPrefixList } from "@cdktf/provider-aws/lib/data-aws-ec2-managed-prefix-list";
import { Instance } from "@cdktf/provider-aws/lib/instance";
import { Kinesisanalyticsv2Application } from "@cdktf/provider-aws/lib/kinesisanalyticsv2-application";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { VpcEndpoint } from "@cdktf/provider-aws/lib/vpc-endpoint";
import { App, TerraformStack } from "cdktf";
import { Port } from "../src/linkage";
import "../src/resources/linkables/instance";
import "../src/resources/linkables/kinesisanalyticsv2-application";
import "../src/resources/linkables/vpc-endpoint";
import "../src/resources/peers/data-aws-ec2-managed-prefix-list";

test("connection test", () => {
  expect(true).toBe(true);
});

test("instance connections", () => {
  const app = new App({
    hclOutput: true,
  });
  class TestStack extends TerraformStack {
    constructor(scope: App, id: string) {
      super(scope, id);
      new AwsProvider(this, "AWS");
      const instance = new Instance(this, "instance", {
        ami: "ami-123456",
        instanceType: "t2.micro",
      });
      expect(instance.linkage).toBeInstanceOf(Object);
      expect(instance.linkage.linkageRules).toEqual([]);
      const otherInstance = new Instance(this, "otherInstance", {
        ami: "ami-123456",
        instanceType: "t2.micro",
      });
      instance.linkage.allowFrom(
        otherInstance.linkage,
        new Port(80),
        new Port(80),
        "tcp",
      );
      expect(instance.linkage.linkageRules).toHaveLength(1);
      expect(instance.linkage.linkageRules[0]).toEqual(
        expect.objectContaining({
          direction: "in",
          fromPort: new Port(80),
          toPort: new Port(80),
          protocol: "tcp",
        }),
      );
      expect(otherInstance.linkage.linkageRules).toHaveLength(1);
      expect(otherInstance.linkage.linkageRules[0]).toEqual(
        expect.objectContaining({
          direction: "out",
          fromPort: new Port(80),
          toPort: new Port(80),
          protocol: "tcp",
        }),
      );

      const s3Prefix = new DataAwsEc2ManagedPrefixList(this, "prefixList-s3", {
        name: "com.amazonaws.us-east-1.s3",
      });

      instance.linkage.allowTo(s3Prefix, new Port(443), new Port(443), "tcp");
      expect(instance.linkage.linkageRules).toHaveLength(2);

      const kinesisApp = new Kinesisanalyticsv2Application(this, "kinesisApp", {
        name: "test-app",
        runtimeEnvironment: "FLINK-1_11",
        serviceExecutionRole:
          "arn:aws:iam::123456789012:role/service-role/AmazonKinesisAnalytics-ExecutionRole",
        applicationConfiguration: {
          applicationCodeConfiguration: {
            codeContentType: "PLAINTEXT",
            codeContent: {
              textContent: "test",
            },
          },
          vpcConfiguration: {
            subnetIds: ["subnet-123456"],
            securityGroupIds: [],
          },
        },
      });
      kinesisApp.linkage.allowFrom(
        instance.linkage,
        new Port(8081),
        new Port(8081),
        "tcp",
      );
      expect(kinesisApp.linkage.linkageRules).toHaveLength(1);

      const endpoint = new VpcEndpoint(this, "vpcEndpoint", {
        vpcId: "vpc-123456",
        vpcEndpointType: "Interface",
      });
      endpoint.linkage.allowFrom(
        instance.linkage,
        new Port(443),
        new Port(443),
        "tcp",
      );
      expect(endpoint.linkage.linkageRules).toHaveLength(1);
    }
  }
  new TestStack(app, "test-stack");
  app.synth();
});
