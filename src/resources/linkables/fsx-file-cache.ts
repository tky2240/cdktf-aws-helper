import { DataAwsSubnet } from "@cdktf/provider-aws/lib/data-aws-subnet";
import { FsxFileCache } from "@cdktf/provider-aws/lib/fsx-file-cache";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { Fn } from "cdktf";
import { Construct } from "constructs";
import { ILinkable, Linkage } from "../../linkage";

declare module "@cdktf/provider-aws/lib/fsx-file-cache" {
  interface FsxFileCache extends ILinkable {}
}

const OriginalFsxFileCache = FsxFileCache;

//@ts-expect-error override constructor
FsxFileCache = function (
  ...args: [scope: Construct, id: string, config: any]
): FsxFileCache {
  const fsx = Reflect.construct(OriginalFsxFileCache, args) as FsxFileCache;
  const scope = fsx.node.scope;
  if (!scope) {
    throw new Error("FSx FileCache must have a scope");
  }
  const subnetId = fsx.subnetIdsInput?.[0];
  if (subnetId == null) {
    throw new Error("Subnet ID must be specified");
  }
  const sg = new SecurityGroup(scope, `${fsx.node.id}-SG`, {
    name: `${fsx.node.id}-SG`,
    description: `Security group for ${fsx.node.id}`,
    vpcId: new DataAwsSubnet(scope, `${fsx.node.id}-SubnetData`, {
      id: subnetId,
    }).vpcId,
  });
  fsx.securityGroupIds = Fn.flatten([[fsx.securityGroupIdsInput], sg.id]);
  Object.defineProperty(fsx, "linkage", {
    value: new Linkage(scope, `${fsx.node.id}-Linkage`, {
      peer: sg,
    }),
  });
  return fsx;
};

Object.setPrototypeOf(FsxFileCache, OriginalFsxFileCache);
