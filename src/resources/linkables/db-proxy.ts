import { DataAwsSubnet } from "@cdktf/provider-aws/lib/data-aws-subnet";
import { DbProxy } from "@cdktf/provider-aws/lib/db-proxy";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { Fn } from "cdktf";
import { Construct } from "constructs";
import { ILinkable, Linkage } from "../../linkage";

declare module "@cdktf/provider-aws/lib/db-proxy" {
  interface DbProxy extends ILinkable {}
}

const OriginalDbProxy = DbProxy;

//@ts-expect-error override constructor
DbProxy = function (
  ...args: [scope: Construct, id: string, config: any]
): DbProxy {
  const proxy = Reflect.construct(OriginalDbProxy, args) as DbProxy;
  const scope = proxy.node.scope;
  if (!scope) {
    throw new Error("DB Proxy must have a scope");
  }

  const subnetId = proxy.vpcSubnetIdsInput?.[0];
  if (subnetId == null) {
    throw new Error("Subnet ID must be specified");
  }
  const sg = new SecurityGroup(scope, `${proxy.node.id}-SG`, {
    name: `${proxy.node.id}-SG`,
    description: `Security group for ${proxy.node.id}`,
    vpcId: new DataAwsSubnet(scope, `${proxy.node.id}-SubnetData`, {
      id: subnetId,
    }).vpcId,
  });
  proxy.vpcSecurityGroupIds = Fn.flatten([
    [proxy.vpcSecurityGroupIdsInput],
    sg.id,
  ]);
  Object.defineProperty(proxy, "linkage", {
    value: new Linkage(scope, `${proxy.node.id}-Linkage`, {
      peer: sg,
    }),
  });
  return proxy;
};

Object.setPrototypeOf(DbProxy, OriginalDbProxy);
