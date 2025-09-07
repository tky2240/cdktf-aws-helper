import { DataAwsSecurityGroup } from "@cdktf/provider-aws/lib/data-aws-security-group";
import { Construct } from "constructs";
import { IPeer } from "../../linkage";

const DATA_AWS_SECURITY_GROUP_SYMBOL = Symbol.for("DATA_AWS_SECURITY_GROUP");

declare module "@cdktf/provider-aws/lib/data-aws-security-group" {
  interface DataAwsSecurityGroup extends IPeer {}
}

const OriginalDataAwsSecurityGroup = DataAwsSecurityGroup;

//@ts-expect-error
DataAwsSecurityGroup = function (
  ...args: [scope: Construct, id: string, config: any]
): DataAwsSecurityGroup {
  const securityGroup = Reflect.construct(
    OriginalDataAwsSecurityGroup,
    args,
  ) as DataAwsSecurityGroup;
  const scope = securityGroup.node.scope;
  if (!scope) {
    throw new Error("DataAwsSecurityGroup must have a scope");
  }
  Object.defineProperty(securityGroup, DATA_AWS_SECURITY_GROUP_SYMBOL, {
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

Object.setPrototypeOf(DataAwsSecurityGroup, OriginalDataAwsSecurityGroup);

export function isDataAwsSecurityGroup(x: unknown): x is DataAwsSecurityGroup {
  return (
    x != null && typeof x === "object" && DATA_AWS_SECURITY_GROUP_SYMBOL in x
  );
}
