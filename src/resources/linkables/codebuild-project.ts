import { CodebuildProject } from "@cdktf/provider-aws/lib/codebuild-project";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { Fn } from "cdktf";
import { Construct } from "constructs";
import { ILinkable, Linkage } from "../../linkage";

declare module "@cdktf/provider-aws/lib/codebuild-project" {
  interface CodebuildProject extends ILinkable {}
}

const OriginalCodebuildProject = CodebuildProject;

//@ts-expect-error override constructor
CodebuildProject = function (
  ...args: [scope: Construct, id: string, config: any]
): CodebuildProject {
  const codebuild = Reflect.construct(
    OriginalCodebuildProject,
    args,
  ) as CodebuildProject;
  const scope = codebuild.node.scope;
  if (!scope) {
    throw new Error("Codebuild Project must have a scope");
  }
  Object.defineProperty(codebuild, "linkage", {
    get() {
      //@ts-expect-error
      if (codebuild._linkage == null) {
        throw new Error("This Codebuild Project is not associated with a VPC");
      }
      //@ts-expect-error
      return codebuild._linkage;
    },
  });

  if (codebuild.vpcConfig.vpcIdInput != null) {
    const sg = new SecurityGroup(scope, `${codebuild.node.id}-SG`, {
      name: `${codebuild.node.id}-SG`,
      description: `Security group for ${codebuild.node.id}`,
      vpcId: codebuild.vpcConfig.vpcIdInput,
    });
    codebuild.vpcConfig.securityGroupIds = Fn.flatten([
      [codebuild.vpcConfig.securityGroupIdsInput],
      sg.id,
    ]);
    Object.defineProperty(codebuild, "_linkage", {
      value: new Linkage(scope, `${codebuild.node.id}-Linkage`, {
        peer: sg,
      }),
    });
  }
  return codebuild;
};

Object.setPrototypeOf(CodebuildProject, OriginalCodebuildProject);
