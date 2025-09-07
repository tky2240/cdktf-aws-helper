# cdktf-aws-helper

A helper library for AWS CDK for Terraform (cdktf) to manage security groups more easily.

This library inspired by [aws-cdk](https://github.com/aws/aws-cdk).

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Contributing](#contributing)
- [License](#license)

## Installation

TODO: Provide installation instructions here.

## Usage

Currently, you can see test code in [test/linkage.test.ts](test/linkage.test.ts).

## Features

Provide Linkage class for cdktf-aws-provider

### Support two-way link resources

- [apprunner_vpc_connector](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/apprunner_vpc_connector)
- [batch_compute_environment](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/batch_compute_environment)
- [codebuild_project](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/codebuild_project)
- [db_instance](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/db_instance)
- [db_proxy](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/db_proxy)
- [docdb_cluster](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/docdb_cluster)
- [ec2_client_vpn_endpoint](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ec2_client_vpn_endpoint)
- [ecs_service](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecs_service)
- [ecs_task_set](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecs_task_set)
- [efs_mount_target](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/efs_mount_target)
- [eks_cluster](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/eks_cluster)
- [fsx_file_cache](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/fsx_file_cache)
- [fsx_lustre_file_system](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/fsx_lustre_file_system)
- [fsx_ontap_file_system](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/fsx_ontap_file_system)
- [fsx_windows_file_system](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/fsx_windows_file_system)
- [fsx_openzfs_file_system](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/fsx_openzfs_file_system)
- [instance](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/instance)
- [kinesisanalyticsv2_application](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/kinesisanalyticsv2_application)
- [kinesis_firehose_delivery_stream](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/kinesis_firehose_delivery_stream)
- [lambda_function](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function)
- [launch_template](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/launch_template)
- [lb](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb)
- [msk_cluster](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/msk_cluster)
- [neptune_cluster](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/neptune_cluster)
- [opensearch_domain](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/opensearch_domain)
- [rds_cluster](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/rds_cluster)
- [redshift_cluster](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/redshift_cluster)
- [sagemaker_model](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/sagemaker_model)
- [synthetics_canary](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/synthetics_canary)
- [vpc_endpoint](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/vpc_endpoint)

### Support link destination only resources

- [data-aws-ec2-managed-prefix-list](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/ec2_managed_prefix_list)
- [data-aws-security-group](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/security_group)
- [ec2-managed-prefix-list](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ec2_managed_prefix_list)
- [security-group](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/security_group)

## Contributing

TODO: Provide contribution guidelines here.

## License

This project is licensed under the [MIT License](LICENSE).
