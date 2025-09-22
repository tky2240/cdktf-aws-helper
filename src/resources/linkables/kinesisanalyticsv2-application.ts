import { DataAwsSubnet } from "@cdktf/provider-aws/lib/data-aws-subnet";
import { Kinesisanalyticsv2Application } from "@cdktf/provider-aws/lib/kinesisanalyticsv2-application";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { Fn } from "cdktf";
import { Construct } from "constructs";
import { ILinkable, Linkage } from "../../linkage";

declare module "@cdktf/provider-aws/lib/kinesisanalyticsv2-application" {
  interface Kinesisanalyticsv2Application extends ILinkable {}
}

const OriginalKinesisanalyticsv2Application = Kinesisanalyticsv2Application;

//@ts-expect-error override constructor
Kinesisanalyticsv2Application = function (
  ...args: [scope: Construct, id: string, config: any]
): Kinesisanalyticsv2Application {
  const application = Reflect.construct(
    OriginalKinesisanalyticsv2Application,
    args,
  ) as Kinesisanalyticsv2Application;
  const scope = application.node.scope;
  if (!scope) {
    throw new Error("Kinesis Analytics V2 Application must have a scope");
  }
  Object.defineProperty(application, "linkage", {
    get() {
      //@ts-expect-error
      if (application._linkage == null) {
        throw new Error("This Application is not associated with a VPC");
      }
      //@ts-expect-error
      return application._linkage;
    },
  });
  if (application.applicationConfiguration.vpcConfigurationInput != null) {
    const subnetId =
      application.applicationConfiguration.vpcConfiguration.subnetIdsInput?.[0];
    if (subnetId == null) {
      throw new Error("Subnet ID must be specified");
    }
    const sg = new SecurityGroup(scope, `${application.node.id}-SG`, {
      name: `${application.node.id}-SG`,
      description: `Security group for ${application.node.id}`,
      vpcId: new DataAwsSubnet(scope, `${application.node.id}-SubnetData`, {
        id: subnetId,
      }).vpcId,
    });
    application.applicationConfiguration.vpcConfiguration.securityGroupIds =
      Fn.flatten([
        [
          application.applicationConfiguration.vpcConfiguration
            .securityGroupIdsInput,
        ],
        sg.id,
      ]);
    Object.defineProperty(application, "_linkage", {
      value: new Linkage(scope, `${application.node.id}-Linkage`, {
        peer: sg,
      }),
    });
  }
  return application;
};

Object.setPrototypeOf(
  Kinesisanalyticsv2Application,
  OriginalKinesisanalyticsv2Application,
);
