import { DbProxy } from "@cdktf/provider-aws/lib/db-proxy";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "../../src/resources/linkables/db-proxy";
import {
  createSecurityGroupInput,
  createVpcIdString,
  TestSuite,
} from "./suite";

const constructId = "test-db-proxy";

export const DB_PROXY_TEST_SUITE: TestSuite<typeof DbProxy> = {
  specifySecurityGroup: {
    inputConfig: {
      name: "test-db-proxy",
      auth: [
        {
          authScheme: "SECRETS",
          secretArn:
            "arn:aws:secretsmanager:us-west-2:123456789012:secret:test-secret",
          iamAuth: "DISABLED",
        },
      ],
      engineFamily: "MYSQL",
      roleArn: "arn:aws:iam::123456789012:role/test-role",
      vpcSubnetIds: ["subnet-123456"],
      vpcSecurityGroupIds: ["sg-123456"],
    },
    inputStackConstructor: (scope, config) => {
      new DbProxy(scope, constructId, config);
    },
    expectedSecurityGroupIdsString: createSecurityGroupInput(constructId, [
      {
        isToken: false,
        value: "sg-123456",
      },
    ]),
    expectedSecurityGroupName: `${constructId}-SG`,
    expectedVpcIdString: createVpcIdString(constructId, "subnet"),
    expectedError: false,
  },
  specifyNoSecurityGroup: {
    inputConfig: {
      name: "test-db-proxy",
      auth: [
        {
          authScheme: "SECRETS",
          secretArn:
            "arn:aws:secretsmanager:us-west-2:123456789012:secret:test-secret",
          iamAuth: "DISABLED",
        },
      ],
      engineFamily: "MYSQL",
      roleArn: "arn:aws:iam::123456789012:role/test-role",
      vpcSubnetIds: ["subnet-123456"],
    },
    inputStackConstructor: (scope, config) => {
      new DbProxy(scope, constructId, config);
    },
    expectedSecurityGroupIdsString: createSecurityGroupInput(
      constructId,
      undefined,
    ),
    expectedSecurityGroupName: `${constructId}-SG`,
    expectedVpcIdString: createVpcIdString(constructId, "subnet"),
    expectedError: false,
  },
  specifyTokenizedSecurityGroup: {
    inputConfig: {
      name: "test-db-proxy",
      auth: [
        {
          authScheme: "SECRETS",
          secretArn:
            "arn:aws:secretsmanager:us-west-2:123456789012:secret:test-secret",
          iamAuth: "DISABLED",
        },
      ],
      engineFamily: "MYSQL",
      roleArn: "arn:aws:iam::123456789012:role/test-role",
      vpcSubnetIds: ["subnet-123456"],
      vpcSecurityGroupIds: [],
    },
    inputStackConstructor: (scope, config) => {
      const sg = new SecurityGroup(scope, "sg", {
        name: "test-sg",
        vpcId: "vpc-123456",
      });
      new DbProxy(scope, constructId, {
        ...config,
        vpcSecurityGroupIds: [sg.id],
      });
    },
    expectedSecurityGroupIdsString: createSecurityGroupInput(constructId, [
      { isToken: true, value: "aws_security_group.sg.id" },
    ]),
    expectedSecurityGroupName: `${constructId}-SG`,
    expectedVpcIdString: createVpcIdString(constructId, "subnet"),
    expectedError: false,
  },
  specifyNoSubnet: {
    inputConfig: {
      name: "test-db-proxy",
      auth: [
        {
          authScheme: "SECRETS",
          secretArn:
            "arn:aws:secretsmanager:us-west-2:123456789012:secret:test-secret",
          iamAuth: "DISABLED",
        },
      ],
      engineFamily: "MYSQL",
      roleArn: "arn:aws:iam::123456789012:role/test-role",
      vpcSecurityGroupIds: ["sg-123456"],
      vpcSubnetIds: [],
    },
    inputStackConstructor: (scope, config) => {
      new DbProxy(scope, constructId, config);
    },
    expectedError: true,
  },
} as const;
