import { ApprunnerVpcConnector } from "@cdktf/provider-aws/lib/apprunner-vpc-connector";
import { App, TerraformStack, Testing } from "cdktf";
import "cdktf/lib/testing/adapters/jest";
import "../../src/resources/linkables/apprunner-vpc-connector";

describe("ApprunnerVpcConnector Linkable", () => {
  test("should have linkage security group with specified sg", () => {
    const app = Testing.app();
    class TestStack extends TerraformStack {
      constructor(scope: App, id: string) {
        super(scope, id);
        new ApprunnerVpcConnector(this, "TestConnector", {
          vpcConnectorName: "test-connector",
          subnets: ["subnet-123456"],
          securityGroups: ["sg-123456"],
        });
      }
    }
    const stack = new TestStack(app, "test-stack");
    const synth = Testing.synth(stack);
    expect(synth).toHaveResourceWithProperties(ApprunnerVpcConnector, {
      vpc_connector_name: "test-connector",
      subnets: ["subnet-123456"],
      security_groups:
        '${flatten([["sg-123456"], aws_security_group.TestConnector-SG.id])}',
    });
  });
  test("should create security group if no sg provided", () => {
    const app = Testing.app();
    class TestStack extends TerraformStack {
      constructor(scope: App, id: string) {
        super(scope, id);
        new ApprunnerVpcConnector(this, "TestConnector", {
          vpcConnectorName: "test-connector",
          subnets: ["subnet-123456"],
          securityGroups: [],
        });
      }
    }
    const stack = new TestStack(app, "test-stack");
    const synth = Testing.synth(stack);
    expect(synth).toHaveResourceWithProperties(ApprunnerVpcConnector, {
      vpc_connector_name: "test-connector",
      subnets: ["subnet-123456"],
      security_groups:
        "${flatten([[], aws_security_group.TestConnector-SG.id])}",
    });
  });
});
