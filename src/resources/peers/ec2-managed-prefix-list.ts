import { Ec2ManagedPrefixList } from "@cdktf/provider-aws/lib/ec2-managed-prefix-list";
import { Construct } from "constructs";
import { IPeer } from "../../linkage";

const EC2_MANAGED_PREFIX_LIST_SYMBOL = Symbol.for("EC2_MANAGED_PREFIX_LIST");

declare module "@cdktf/provider-aws/lib/ec2-managed-prefix-list" {
  interface Ec2ManagedPrefixList extends IPeer {}
}

const OriginalEc2ManagedPrefixList = Ec2ManagedPrefixList;

//@ts-expect-error override constructor
Ec2ManagedPrefixList = function (
  ...args: [scope: Construct, id: string, config: any]
): Ec2ManagedPrefixList {
  const prefixList = Reflect.construct(
    OriginalEc2ManagedPrefixList,
    args,
  ) as Ec2ManagedPrefixList;
  const scope = prefixList.node.scope;
  if (!scope) {
    throw new Error("Ec2ManagedPrefixList must have a scope");
  }
  Object.defineProperty(prefixList, EC2_MANAGED_PREFIX_LIST_SYMBOL, {
    value: true,
  });
  Object.defineProperty(prefixList, "peerId", {
    value: prefixList.id,
  });
  Object.defineProperty(prefixList, "uniqueId", {
    value: prefixList.node.id,
  });
  return prefixList;
};

Object.setPrototypeOf(Ec2ManagedPrefixList, OriginalEc2ManagedPrefixList);

export function isEc2ManagedPrefixList(x: unknown): x is Ec2ManagedPrefixList {
  return (
    x != null && typeof x === "object" && EC2_MANAGED_PREFIX_LIST_SYMBOL in x
  );
}
