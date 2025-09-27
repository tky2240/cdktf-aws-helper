import { Kinesisanalyticsv2Application } from "@cdktf/provider-aws/lib/kinesisanalyticsv2-application";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "../../src/resources/linkables/kinesisanalyticsv2-application";
import {
  createSecurityGroupInput,
  createVpcIdString,
  TestSuite,
} from "./suite";

const constructId = "test-kinesisanalyticsv2-application";

export const KINESISANALYTICSV2_APPLICATION_TEST_SUITE: TestSuite<
  typeof Kinesisanalyticsv2Application
> = {
  specifySecurityGroup: {
    inputConfig: {
      name: "test-analytics-app",
      runtimeEnvironment: "SQL-1_0",
      serviceExecutionRole: "arn:aws:iam::123456789012:role/analytics_role",
      applicationConfiguration: {
        applicationCodeConfiguration: {
          codeContent: {
            textContent: "SELECT * FROM source;",
          },
          codeContentType: "PLAINTEXT",
        },
        vpcConfiguration: {
          subnetIds: ["subnet-123456"],
          securityGroupIds: ["sg-123456"],
        },
      },
    },
    inputStackConstructor: (scope, config) => {
      new Kinesisanalyticsv2Application(scope, constructId, config);
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
      name: "test-analytics-app",
      runtimeEnvironment: "SQL-1_0",
      serviceExecutionRole: "arn:aws:iam::123456789012:role/analytics_role",
      applicationConfiguration: {
        applicationCodeConfiguration: {
          codeContent: {
            textContent: "SELECT * FROM source;",
          },
          codeContentType: "PLAINTEXT",
        },
        vpcConfiguration: {
          subnetIds: ["subnet-123456"],
          securityGroupIds: [],
        },
      },
    },
    inputStackConstructor: (scope, config) => {
      new Kinesisanalyticsv2Application(scope, constructId, config);
    },
    expectedSecurityGroupIdsString: createSecurityGroupInput(constructId, []),
    expectedSecurityGroupName: `${constructId}-SG`,
    expectedVpcIdString: createVpcIdString(constructId, "subnet"),
    expectedDataAwsSubnet: "subnet-123456",
    expectedError: false,
  },
  specifyTokenizedSecurityGroup: {
    inputConfig: {
      name: "test-analytics-app",
      runtimeEnvironment: "SQL-1_0",
      serviceExecutionRole: "arn:aws:iam::123456789012:role/analytics_role",
      applicationConfiguration: {
        applicationCodeConfiguration: {
          codeContent: {
            textContent: "SELECT * FROM source;",
          },
          codeContentType: "PLAINTEXT",
        },
        vpcConfiguration: {
          subnetIds: ["subnet-123456"],
          securityGroupIds: ["sg-123456"],
        },
      },
    },
    inputStackConstructor: (scope, config) => {
      const sg = new SecurityGroup(scope, "sg", {
        name: "test-sg",
        vpcId: "vpc-123456",
      });
      if (config.applicationConfiguration == null) {
        throw new Error("applicationConfiguration is undefined");
      }
      if (config.applicationConfiguration.vpcConfiguration?.subnetIds == null) {
        throw new Error("subnetIds is undefined");
      }
      new Kinesisanalyticsv2Application(scope, constructId, {
        ...config,
        applicationConfiguration: {
          ...config.applicationConfiguration,
          vpcConfiguration: {
            ...config.applicationConfiguration.vpcConfiguration,
            securityGroupIds: [sg.id],
          },
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
  specifyNoSubnet: {
    inputConfig: {
      name: "test-analytics-app",
      runtimeEnvironment: "SQL-1_0",
      serviceExecutionRole: "arn:aws:iam::123456789012:role/analytics_role",
      applicationConfiguration: {
        applicationCodeConfiguration: {
          codeContent: {
            textContent: "SELECT * FROM source;",
          },
          codeContentType: "PLAINTEXT",
        },
        vpcConfiguration: {
          subnetIds: [],
          securityGroupIds: ["sg-123456"],
        },
      },
    },
    inputStackConstructor: (scope, config) => {
      new Kinesisanalyticsv2Application(scope, constructId, config);
    },
    expectedError: true,
  },
} as const;
