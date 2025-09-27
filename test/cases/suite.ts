import { ApprunnerVpcConnector } from "@cdktf/provider-aws/lib/apprunner-vpc-connector";
import { BatchComputeEnvironment } from "@cdktf/provider-aws/lib/batch-compute-environment";
import { CodebuildProject } from "@cdktf/provider-aws/lib/codebuild-project";
import { DbInstance } from "@cdktf/provider-aws/lib/db-instance";
import { DbProxy } from "@cdktf/provider-aws/lib/db-proxy";
import { DocdbCluster } from "@cdktf/provider-aws/lib/docdb-cluster";
import { Ec2ClientVpnEndpoint } from "@cdktf/provider-aws/lib/ec2-client-vpn-endpoint";
import { EcsService } from "@cdktf/provider-aws/lib/ecs-service";
import { EcsTaskSet } from "@cdktf/provider-aws/lib/ecs-task-set";
import { EfsMountTarget } from "@cdktf/provider-aws/lib/efs-mount-target";
import { EksCluster } from "@cdktf/provider-aws/lib/eks-cluster";
import { FsxFileCache } from "@cdktf/provider-aws/lib/fsx-file-cache";
import { FsxLustreFileSystem } from "@cdktf/provider-aws/lib/fsx-lustre-file-system";
import { FsxOntapFileSystem } from "@cdktf/provider-aws/lib/fsx-ontap-file-system";
import { FsxOpenzfsFileSystem } from "@cdktf/provider-aws/lib/fsx-openzfs-file-system";
import { FsxWindowsFileSystem } from "@cdktf/provider-aws/lib/fsx-windows-file-system";
import { Instance } from "@cdktf/provider-aws/lib/instance";
import { KinesisFirehoseDeliveryStream } from "@cdktf/provider-aws/lib/kinesis-firehose-delivery-stream";
import { Kinesisanalyticsv2Application } from "@cdktf/provider-aws/lib/kinesisanalyticsv2-application";
import { LambdaFunction } from "@cdktf/provider-aws/lib/lambda-function";
import { LaunchTemplate } from "@cdktf/provider-aws/lib/launch-template";
import { Lb } from "@cdktf/provider-aws/lib/lb";
import { MskCluster } from "@cdktf/provider-aws/lib/msk-cluster";
import { NeptuneCluster } from "@cdktf/provider-aws/lib/neptune-cluster";
import { OpensearchDomain } from "@cdktf/provider-aws/lib/opensearch-domain";
import { RdsCluster } from "@cdktf/provider-aws/lib/rds-cluster";
import { RedshiftCluster } from "@cdktf/provider-aws/lib/redshift-cluster";
import { SagemakerModel } from "@cdktf/provider-aws/lib/sagemaker-model";
import { SyntheticsCanary } from "@cdktf/provider-aws/lib/synthetics-canary";
import { VpcEndpoint } from "@cdktf/provider-aws/lib/vpc-endpoint";
import { Construct } from "constructs";

export type LinkableResourceType =
  | typeof ApprunnerVpcConnector
  | typeof BatchComputeEnvironment
  | typeof CodebuildProject
  | typeof DbInstance
  | typeof DbProxy
  | typeof DocdbCluster
  | typeof Ec2ClientVpnEndpoint
  | typeof EcsService
  | typeof EcsTaskSet
  | typeof EfsMountTarget
  | typeof EksCluster
  | typeof FsxFileCache
  | typeof FsxLustreFileSystem
  | typeof FsxOntapFileSystem
  | typeof FsxOpenzfsFileSystem
  | typeof FsxWindowsFileSystem
  | typeof Instance
  | typeof KinesisFirehoseDeliveryStream
  | typeof Kinesisanalyticsv2Application
  | typeof LambdaFunction
  | typeof LaunchTemplate
  | typeof Lb
  | typeof MskCluster
  | typeof NeptuneCluster
  | typeof OpensearchDomain
  | typeof RdsCluster
  | typeof RedshiftCluster
  | typeof SagemakerModel
  | typeof SyntheticsCanary
  | typeof VpcEndpoint;

export type TestCase<T extends LinkableResourceType> =
  | {
      readonly inputConfig: ConstructorParameters<T>[2];
      readonly inputStackConstructor: (
        scope: Construct,
        config: ConstructorParameters<T>[2],
      ) => void;
      readonly expectedSecurityGroupIdsString: string | undefined;
      readonly expectedSecurityGroupName: string;
      readonly expectedDataAwsSubnet?: string | undefined;
      readonly expectedVpcIdString: string;
      readonly expectedError: false;
    }
  | {
      readonly inputConfig: ConstructorParameters<T>[2];
      readonly inputStackConstructor: (
        scope: Construct,
        config: ConstructorParameters<T>[2],
      ) => void;
      readonly expectedError: true;
    };

export type TestSuite<T extends LinkableResourceType> = {
  readonly specifySecurityGroup: TestCase<T>;
  readonly specifyNoSecurityGroup: TestCase<T>;
  readonly specifyTokenizedSecurityGroup: TestCase<T>;
  readonly [key: string]: TestCase<T>;
};

export type TestSuites = {
  readonly [key: string]: TestSuite<LinkableResourceType>;
};

export function createSecurityGroupInput(
  constructId: string,
  inputSecurityGroupIds:
    | {
        isToken: boolean;
        value: string;
      }[]
    | undefined,
): string {
  const inputString = (() => {
    if (inputSecurityGroupIds == null) {
      return "";
    } else if (inputSecurityGroupIds.length === 0) {
      return "[]";
    }
    return `[${inputSecurityGroupIds
      .map((sg) => (sg.isToken ? sg.value : JSON.stringify(sg.value)))
      .join(",")}]`;
  })();
  return `\${flatten([[${inputString}], aws_security_group.${constructId}-SG.id])}`;
}

export type VpcDataSource =
  | "subnet"
  | "vpc"
  | "db-subnet-group"
  | "security-group";

export function createVpcIdString(
  constructId: string,
  vpcDataSource: VpcDataSource,
): string {
  switch (vpcDataSource) {
    case "subnet":
      return `\${data.aws_subnet.${constructId}-SubnetData.vpc_id}`;
    case "vpc":
      return `\${data.aws_vpc.${constructId}-VpcData.id}`;
    case "db-subnet-group":
      return `\${data.aws_db_subnet_group.${constructId}-SubnetData.vpc_id}`;
    case "security-group":
      return `\${data.aws_security_group.${constructId}-SGData.vpc_id}`;
    default:
      throw new Error(
        `Unknown VPC data source: ${vpcDataSource satisfies never}`,
      );
  }
}
