import { OpensearchDomain } from "@cdktf/provider-aws/lib/opensearch-domain";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "../../src/resources/linkables/opensearch-domain";
import {
  createSecurityGroupInput,
  createVpcIdString,
  TestSuite,
} from "./suite";

const constructId = "test-opensearch-domain";

export const OPENSEARCH_DOMAIN_TEST_SUITE: TestSuite<typeof OpensearchDomain> =
  {
    specifySecurityGroup: {
      inputConfig: {
        domainName: "test-domain",
        clusterConfig: { instanceType: "t3.small.search" },
        vpcOptions: {
          securityGroupIds: ["sg-123456"],
          subnetIds: ["subnet-123456"],
        },
      },
      inputStackConstructor: (scope, config) => {
        new OpensearchDomain(scope, constructId, config);
      },
      expectedSecurityGroupIdsString: createSecurityGroupInput(constructId, [
        {
          isToken: false,
          value: "sg-123456",
        },
      ]),
      expectedSecurityGroupName: `${constructId}-SG`,
      expectedVpcIdString: createVpcIdString(constructId, "subnet"),
      expectedDataAwsSubnet: "subnet-123456",
      expectedError: false,
    },
    specifyNoSecurityGroup: {
      inputConfig: {
        domainName: "test-domain",
        clusterConfig: { instanceType: "t3.small.search" },
        vpcOptions: {
          securityGroupIds: [],
          subnetIds: ["subnet-123456"],
        },
      },
      inputStackConstructor: (scope, config) => {
        new OpensearchDomain(scope, constructId, config);
      },
      expectedSecurityGroupIdsString: createSecurityGroupInput(constructId, []),
      expectedSecurityGroupName: `${constructId}-SG`,
      expectedVpcIdString: createVpcIdString(constructId, "subnet"),
      expectedDataAwsSubnet: "subnet-123456",
      expectedError: false,
    },
    specifyTokenizedSecurityGroup: {
      inputConfig: {
        domainName: "test-domain",
        clusterConfig: { instanceType: "t3.small.search" },
        vpcOptions: {
          securityGroupIds: [],
          subnetIds: ["subnet-123456"],
        },
      },
      inputStackConstructor: (scope, config) => {
        const sg = new SecurityGroup(scope, "sg", {
          name: "test-sg",
          vpcId: "vpc-123456",
        });
        new OpensearchDomain(scope, constructId, {
          ...config,
          vpcOptions: {
            ...config.vpcOptions,
            securityGroupIds: [sg.id],
          },
        });
      },
      expectedSecurityGroupIdsString: createSecurityGroupInput(constructId, [
        { isToken: true, value: "aws_security_group.sg.id" },
      ]),
      expectedSecurityGroupName: `${constructId}-SG`,
      expectedVpcIdString: createVpcIdString(constructId, "subnet"),
      expectedDataAwsSubnet: "subnet-123456",
      expectedError: false,
    },
  } as const;
