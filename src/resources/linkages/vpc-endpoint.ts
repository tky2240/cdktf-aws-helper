import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { VpcEndpoint } from "@cdktf/provider-aws/lib/vpc-endpoint";
import { Fn, Token } from "cdktf";
import { Construct } from "constructs";
import { ILinkable, Linkage } from "../../linkage";

declare module "@cdktf/provider-aws/lib/vpc-endpoint" {
  interface VpcEndpoint extends ILinkable {}
}

const OriginalVpcEndpoint = VpcEndpoint;

//@ts-expect-error
VpcEndpoint = function (
  ...args: [scope: Construct, id: string, config: any]
): VpcEndpoint {
  const endpoint = Reflect.construct(OriginalVpcEndpoint, args) as VpcEndpoint;
  const scope = endpoint.node.scope;
  if (!scope) {
    throw new Error("VPC Endpoint must have a scope");
  }
  Object.defineProperty(endpoint, "linkage", {
    get() {
      //@ts-expect-error
      if (endpoint._linkage == null) {
        throw new Error("Only Interface VPC Endpoint has linkage");
      }
      //@ts-expect-error
      return endpoint._linkage;
    },
  });
  const vpcId = endpoint.vpcIdInput;
  if (vpcId == null) {
    throw new Error("VPC ID must be specified");
  }
  if (Token.isUnresolved(endpoint.vpcEndpointTypeInput)) {
    throw new Error(
      "vpcEndpointType cannot be a Token. It must be a concrete value at synthesis time.",
    );
  }
  if (endpoint.vpcEndpointTypeInput === "Interface") {
    const sg = new SecurityGroup(scope, `${endpoint.node.id}-SG`, {
      name: `${endpoint.node.id}-SG`,
      description: `Security group for ${endpoint.node.id}`,
      vpcId: vpcId,
    });
    endpoint.securityGroupIds = Fn.flatten([
      [endpoint.securityGroupIdsInput],
      sg.id,
    ]);
    Object.defineProperty(endpoint, "_linkage", {
      value: new Linkage(scope, `${endpoint.node.id}-Linkage`, {
        peer: sg,
      }),
    });
  }
  return endpoint;
};

Object.setPrototypeOf(VpcEndpoint, OriginalVpcEndpoint);
