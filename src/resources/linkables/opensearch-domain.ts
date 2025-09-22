import { DataAwsSubnet } from "@cdktf/provider-aws/lib/data-aws-subnet";
import { OpensearchDomain } from "@cdktf/provider-aws/lib/opensearch-domain";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { Fn } from "cdktf";
import { Construct } from "constructs";
import { ILinkable, Linkage } from "../../linkage";

declare module "@cdktf/provider-aws/lib/opensearch-domain" {
  interface OpensearchDomain extends ILinkable {}
}

const OriginalOpensearchDomain = OpensearchDomain;

//@ts-expect-error override constructor
OpensearchDomain = function (
  ...args: [scope: Construct, id: string, config: any]
): OpensearchDomain {
  const domain = Reflect.construct(
    OriginalOpensearchDomain,
    args,
  ) as OpensearchDomain;
  const scope = domain.node.scope;
  if (!scope) {
    throw new Error("Opensearch Domain must have a scope");
  }
  Object.defineProperty(domain, "linkage", {
    get() {
      //@ts-expect-error check vpc association
      if (domain._linkage == null) {
        throw new Error("Only VPC associated Opensearch Domain has linkage");
      }
      //@ts-expect-error return private field
      return domain._linkage;
    },
  });
  const subnetId = domain.vpcOptions?.subnetIdsInput?.[0];
  if (subnetId != null) {
    const sg = new SecurityGroup(scope, `${domain.node.id}-SG`, {
      name: `${domain.node.id}-SG`,
      description: `Security group for ${domain.node.id}`,
      vpcId: new DataAwsSubnet(scope, `${domain.node.id}-SubnetData`, {
        id: subnetId,
      }).vpcId,
    });
    domain.vpcOptions.securityGroupIds = Fn.flatten([
      [domain.vpcOptions.securityGroupIdsInput],
      sg.id,
    ]);
    Object.defineProperty(domain, "_linkage", {
      value: new Linkage(scope, `${domain.node.id}-Linkage`, {
        peer: sg,
      }),
    });
  }
  return domain;
};

Object.setPrototypeOf(OpensearchDomain, OriginalOpensearchDomain);
