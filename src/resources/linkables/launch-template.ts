import { DataAwsSecurityGroup } from "@cdktf/provider-aws/lib/data-aws-security-group";
import {
  LaunchTemplate,
  LaunchTemplateConfig,
} from "@cdktf/provider-aws/lib/launch-template";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { Fn } from "cdktf";
import { Construct } from "constructs";
import { ILinkable, Linkage } from "../../linkage";

declare module "@cdktf/provider-aws/lib/launch-template" {
  interface LaunchTemplate extends ILinkable {}
}

const OriginalLaunchTemplate = LaunchTemplate;

//@ts-expect-error override constructor
LaunchTemplate = function (
  ...args: [scope: Construct, id: string, config: LaunchTemplateConfig]
): LaunchTemplate {
  const template = Reflect.construct(OriginalLaunchTemplate, args);
  const scope = template.node.scope;
  if (!scope) {
    throw new Error("Launch Template must have a scope");
  }
  Object.defineProperty(template, "linkage", {
    get() {
      //@ts-expect-error check another security group
      if (template._linkage == null) {
        throw new Error(
          "This Launch Template is not initialized with another security group",
        );
      }
      //@ts-expect-error return private field
      return template._linkage;
    },
  });
  const anotherSgId = template.vpcSecurityGroupIdsInput?.[0];
  if (anotherSgId != null) {
    const sg = new SecurityGroup(scope, `${template.node.id}-SG`, {
      name: `${template.node.id}-SG`,
      description: `Security group for ${template.node.id}`,
      vpcId: new DataAwsSecurityGroup(scope, `${template.node.id}-SGData`, {
        id: anotherSgId,
      }).vpcId,
    });
    template.vpcSecurityGroupIds = Fn.flatten([
      [template.vpcSecurityGroupIdsInput],
      sg.id,
    ]);
    Object.defineProperty(template, "_linkage", {
      value: new Linkage(scope, `${template.node.id}-Linkage`, {
        peer: sg,
      }),
    });
  }
  return template;
};

Object.setPrototypeOf(LaunchTemplate, OriginalLaunchTemplate);
