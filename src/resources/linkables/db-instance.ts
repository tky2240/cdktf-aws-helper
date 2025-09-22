import { DataAwsDbSubnetGroup } from "@cdktf/provider-aws/lib/data-aws-db-subnet-group";
import { DataAwsVpc } from "@cdktf/provider-aws/lib/data-aws-vpc";
import {
  DbInstance,
  DbInstanceConfig,
} from "@cdktf/provider-aws/lib/db-instance";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { Fn } from "cdktf";
import { Construct } from "constructs";
import { ILinkable, Linkage } from "../../linkage";

declare module "@cdktf/provider-aws/lib/db-instance" {
  interface DbInstance extends ILinkable {}
}

const OriginalDbInstance = DbInstance;

//@ts-expect-error override constructor
DbInstance = function (
  ...args: [scope: Construct, id: string, config: DbInstanceConfig]
): DbInstance {
  const instance = Reflect.construct(OriginalDbInstance, args);
  const scope = instance.node.scope;
  if (!scope) {
    throw new Error("DB Instance must have a scope");
  }

  const subnetGroupName = instance.dbSubnetGroupNameInput;
  const sg = new SecurityGroup(scope, `${instance.node.id}-SG`, {
    name: `${instance.node.id}-SG`,
    description: `Security group for ${instance.node.id}`,
    vpcId: (() => {
      if (subnetGroupName) {
        return new DataAwsDbSubnetGroup(
          scope,
          `${instance.node.id}-SubnetData`,
          {
            name: subnetGroupName,
          },
        ).vpcId;
      } else {
        return new DataAwsVpc(scope, `${instance.node.id}-VPCData`, {
          default: true,
        }).id;
      }
    })(),
  });
  instance.vpcSecurityGroupIds = Fn.flatten([
    [instance.vpcSecurityGroupIdsInput],
    sg.id,
  ]);
  Object.defineProperty(instance, "linkage", {
    value: new Linkage(scope, `${instance.node.id}-Linkage`, {
      peer: sg,
    }),
  });
  return instance;
};

Object.setPrototypeOf(DbInstance, OriginalDbInstance);
