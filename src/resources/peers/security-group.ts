import {
  SecurityGroup,
  SecurityGroupConfig,
} from "@cdktf/provider-aws/lib/security-group";
import { Construct } from "constructs";
import { IPeer } from "../../linkage";

const SECURITY_GROUP_SYMBOL = Symbol.for("SECURITY_GROUP");

declare module "@cdktf/provider-aws/lib/security-group" {
  interface SecurityGroup extends IPeer {}
}

const OriginalSecurityGroup = SecurityGroup;

//@ts-expect-error override constructor
SecurityGroup = function (
  ...args: [scope: Construct, id: string, config: SecurityGroupConfig]
): SecurityGroup {
  const securityGroup = Reflect.construct(OriginalSecurityGroup, args);
  const scope = securityGroup.node.scope;
  if (!scope) {
    throw new Error("SecurityGroup must have a scope");
  }
  Object.defineProperty(securityGroup, SECURITY_GROUP_SYMBOL, {
    value: true,
  });
  Object.defineProperty(securityGroup, "peerId", {
    value: securityGroup.id,
  });
  Object.defineProperty(securityGroup, "uniqueId", {
    value: securityGroup.node.id,
  });
  return securityGroup;
};

Object.setPrototypeOf(SecurityGroup, OriginalSecurityGroup);

export function isSecurityGroup(x: unknown): x is SecurityGroup {
  return x != null && typeof x === "object" && SECURITY_GROUP_SYMBOL in x;
}
