import { DataAwsVpc } from "@cdktf/provider-aws/lib/data-aws-vpc";
import { Ec2ClientVpnEndpoint } from "@cdktf/provider-aws/lib/ec2-client-vpn-endpoint";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { Fn } from "cdktf";
import { Construct } from "constructs";
import { ILinkable, Linkage } from "../../linkage";

declare module "@cdktf/provider-aws/lib/ec2-client-vpn-endpoint" {
  interface Ec2ClientVpnEndpoint extends ILinkable {}
}

const OriginalEc2ClientVpnEndpoint = Ec2ClientVpnEndpoint;

//@ts-expect-error
Ec2ClientVpnEndpoint = function (
  ...args: [scope: Construct, id: string, config: any]
): Ec2ClientVpnEndpoint {
  const endpoint = Reflect.construct(
    OriginalEc2ClientVpnEndpoint,
    args,
  ) as Ec2ClientVpnEndpoint;
  const scope = endpoint.node.scope;
  if (!scope) {
    throw new Error("ClientVpn Endpoint must have a scope");
  }
  const sg = new SecurityGroup(scope, `${endpoint.node.id}-SG`, {
    name: `${endpoint.node.id}-SG`,
    description: `Security group for ${endpoint.node.id}`,
    vpcId: (() => {
      if (endpoint.vpcIdInput == null) {
        return new DataAwsVpc(scope, `${endpoint.node.id}-VPCData`, {
          default: true,
        }).id;
      }
      return endpoint.vpcIdInput;
    })(),
  });
  endpoint.securityGroupIds = Fn.flatten([
    [endpoint.securityGroupIdsInput],
    sg.id,
  ]);
  Object.defineProperty(endpoint, "linkage", {
    value: new Linkage(scope, `${endpoint.node.id}-Linkage`, {
      peer: sg,
    }),
  });
  return endpoint;
};

Object.setPrototypeOf(Ec2ClientVpnEndpoint, OriginalEc2ClientVpnEndpoint);
