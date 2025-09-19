import { Ec2ClientVpnEndpoint } from "@cdktf/provider-aws/lib/ec2-client-vpn-endpoint";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import "cdktf/lib/testing/adapters/jest";
import "../../src/resources/linkables/ec2-client-vpn-endpoint";
import { EC2_CLIENT_VPN_ENDPOINT_TEST_SUITE } from "../cases/ec2-client-vpn-endpoint";
import { synthTestStack } from "../synth";

describe("Ec2ClientVpnEndpointTestSuites", () => {
  for (const [name, suite] of Object.entries(
    EC2_CLIENT_VPN_ENDPOINT_TEST_SUITE,
  )) {
    test(name, () => {
      const synthed = synthTestStack((scope) => {
        suite.inputStackConstructor(scope, suite.inputConfig);
      });
      if (suite.inputConfig == null) {
        throw new Error("inputConfig is null");
      }
      expect(synthed).toHaveResourceWithProperties(Ec2ClientVpnEndpoint, {
        server_certificate_arn: suite.inputConfig.serverCertificateArn,
        authentication_options: [
          {
            type: Array.isArray(suite.inputConfig.authenticationOptions)
              ? suite.inputConfig.authenticationOptions[0].type
              : undefined,
            root_certificate_chain_arn: Array.isArray(
              suite.inputConfig.authenticationOptions,
            )
              ? suite.inputConfig.authenticationOptions[0]
                  .rootCertificateChainArn
              : undefined,
          },
        ],
        connection_log_options: suite.inputConfig.connectionLogOptions,
        vpc_id: suite.expectedVpcIdString,
        security_group_ids: suite.expectedSecurityGroupIdsString,
      });
      expect(synthed).toHaveResourceWithProperties(SecurityGroup, {
        name: suite.expectedSecurityGroupName,
        vpc_id: suite.expectedVpcIdString,
      });
    });
  }
});
