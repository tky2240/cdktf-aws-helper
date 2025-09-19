import { Ec2ClientVpnEndpoint } from "@cdktf/provider-aws/lib/ec2-client-vpn-endpoint";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "../../src/resources/linkables/ec2-client-vpn-endpoint";
import { createSecurityGroupInput, TestSuite } from "./suite";

const constructId = "test-ec2-client-vpn-endpoint";

export const EC2_CLIENT_VPN_ENDPOINT_TEST_SUITE: TestSuite<
  typeof Ec2ClientVpnEndpoint
> = {
  specifySecurityGroup: {
    inputConfig: {
      serverCertificateArn:
        "arn:aws:acm:us-east-1:123456789012:certificate/abcd1234-abcd-1234-abcd-1234abcd1234",
      authenticationOptions: [
        {
          type: "certificate-authentication",
          rootCertificateChainArn:
            "arn:aws:acm:us-east-1:123456789012:certificate/abcd1234-abcd-1234-abcd-1234abcd1234",
        },
      ],
      connectionLogOptions: { enabled: false },
      vpcId: "vpc-123456",
      securityGroupIds: ["sg-123456"],
    },
    inputStackConstructor: (scope, config) => {
      new Ec2ClientVpnEndpoint(scope, constructId, config);
    },
    expectedSecurityGroupIdsString: createSecurityGroupInput(constructId, [
      {
        isToken: false,
        value: "sg-123456",
      },
    ]),
    expectedSecurityGroupName: `${constructId}-SG`,
    expectedVpcIdString: "vpc-123456",
    expectedError: false,
  },
  specifyNoSecurityGroup: {
    inputConfig: {
      serverCertificateArn:
        "arn:aws:acm:us-east-1:123456789012:certificate/abcd1234-abcd-1234-abcd-1234abcd1234",
      authenticationOptions: [
        {
          type: "certificate-authentication",
          rootCertificateChainArn:
            "arn:aws:acm:us-east-1:123456789012:certificate/abcd1234-abcd-1234-abcd-1234abcd1234",
        },
      ],
      connectionLogOptions: { enabled: false },
      vpcId: "vpc-123456",
    },
    inputStackConstructor: (scope, config) => {
      new Ec2ClientVpnEndpoint(scope, constructId, config);
    },
    expectedSecurityGroupIdsString: createSecurityGroupInput(
      constructId,
      undefined,
    ),
    expectedSecurityGroupName: `${constructId}-SG`,
    expectedVpcIdString: "vpc-123456",
    expectedError: false,
  },
  specifyTokenizedSecurityGroup: {
    inputConfig: {
      serverCertificateArn:
        "arn:aws:acm:us-east-1:123456789012:certificate/abcd1234-abcd-1234-abcd-1234abcd1234",
      authenticationOptions: [
        {
          type: "certificate-authentication",
          rootCertificateChainArn:
            "arn:aws:acm:us-east-1:123456789012:certificate/abcd1234-abcd-1234-abcd-1234abcd1234",
        },
      ],
      connectionLogOptions: { enabled: false },
      vpcId: "vpc-123456",
      securityGroupIds: [],
    },
    inputStackConstructor: (scope, config) => {
      const sg = new SecurityGroup(scope, "sg", {
        name: "test-sg",
        vpcId: "vpc-123456",
      });
      new Ec2ClientVpnEndpoint(scope, constructId, {
        ...config,
        securityGroupIds: [sg.id],
      });
    },
    expectedSecurityGroupIdsString: createSecurityGroupInput(constructId, [
      { isToken: true, value: "aws_security_group.sg.id" },
    ]),
    expectedSecurityGroupName: `${constructId}-SG`,
    expectedVpcIdString: "vpc-123456",
    expectedError: false,
  },
} as const;
