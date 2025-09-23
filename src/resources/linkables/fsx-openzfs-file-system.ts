import { DataAwsSubnet } from "@cdktf/provider-aws/lib/data-aws-subnet";
import {
  FsxOpenzfsFileSystem,
  FsxOpenzfsFileSystemConfig,
} from "@cdktf/provider-aws/lib/fsx-openzfs-file-system";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { Fn } from "cdktf";
import { Construct } from "constructs";
import { ILinkable, Linkage } from "../../linkage";

declare module "@cdktf/provider-aws/lib/fsx-openzfs-file-system" {
  interface FsxOpenzfsFileSystem extends ILinkable {}
}

const OriginalFsxOpenzfsFileSystem = FsxOpenzfsFileSystem;

//@ts-expect-error override constructor
FsxOpenzfsFileSystem = function (
  ...args: [scope: Construct, id: string, config: FsxOpenzfsFileSystemConfig]
): FsxOpenzfsFileSystem {
  const fsx = Reflect.construct(OriginalFsxOpenzfsFileSystem, args);
  const scope = fsx.node.scope;
  if (!scope) {
    throw new Error("FSx OpenZFSFileSystem must have a scope");
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

Object.setPrototypeOf(FsxOpenzfsFileSystem, OriginalFsxOpenzfsFileSystem);
