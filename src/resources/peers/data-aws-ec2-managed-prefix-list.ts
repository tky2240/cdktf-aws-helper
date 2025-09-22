import { DataAwsEc2ManagedPrefixList } from "@cdktf/provider-aws/lib/data-aws-ec2-managed-prefix-list";
import { Construct } from "constructs";
import { IPeer } from "../../linkage";

const DATA_AWS_EC2_MANAGED_PREFIX_LIST_SYMBOL = Symbol.for(
  "DATA_AWS_EC2_MANAGED_PREFIX_LIST",
);

declare module "@cdktf/provider-aws/lib/data-aws-ec2-managed-prefix-list" {
  interface DataAwsEc2ManagedPrefixList extends IPeer {}
}

const OriginalDataAwsEc2ManagedPrefixList = DataAwsEc2ManagedPrefixList;

//@ts-expect-error override constructor
DataAwsEc2ManagedPrefixList = function (
  ...args: [scope: Construct, id: string, config: any]
): DataAwsEc2ManagedPrefixList {
  const prefixList = Reflect.construct(
    OriginalDataAwsEc2ManagedPrefixList,
    args,
  ) as DataAwsEc2ManagedPrefixList;
  const scope = prefixList.node.scope;
  if (!scope) {
    throw new Error("DataAwsEc2ManagedPrefixList must have a scope");
  }
  Object.defineProperty(prefixList, DATA_AWS_EC2_MANAGED_PREFIX_LIST_SYMBOL, {
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

Object.setPrototypeOf(
  DataAwsEc2ManagedPrefixList,
  OriginalDataAwsEc2ManagedPrefixList,
);

export function isDataAwsEc2ManagedPrefixList(
  x: unknown,
): x is DataAwsEc2ManagedPrefixList {
  return (
    x != null &&
    typeof x === "object" &&
    DATA_AWS_EC2_MANAGED_PREFIX_LIST_SYMBOL in x
  );
}
