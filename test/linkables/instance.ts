import { Instance } from "@cdktf/provider-aws/lib/instance";
import { App, TerraformStack, Testing } from "cdktf";
import "cdktf/lib/testing/adapters/jest";
import "../../src/resources/linkables/instance";

describe("Instance Linkable", () => {
  test("should have linkage security group with specified sg", () => {
    const app = Testing.app();
    class TestStack extends TerraformStack {
      constructor(scope: App, id: string) {
        super(scope, id);
        new Instance(this, "TestInstance", {
          ami: "ami-123456",
          instanceType: "t2.micro",
          vpcSecurityGroupIds: ["sg-123456"],
        });
      }
    }
    const stack = new TestStack(app, "test-stack");
    const synth = Testing.synth(stack);
    expect(synth).toHaveResourceWithProperties(Instance, {
      ami: "ami-123456",
      instance_type: "t2.micro",
      vpc_security_group_ids: [
        '${flatten([["sg-123456"], aws_security_group.TestInstance-SG.id])}',
      ],
    });
  });
  test("should create security group if no sg provided", () => {
    const app = Testing.app();
    class TestStack extends TerraformStack {
      constructor(scope: App, id: string) {
        super(scope, id);
        new Instance(this, "TestInstance", {
          ami: "ami-123456",
          instanceType: "t2.micro",
        });
      }
    }
    const stack = new TestStack(app, "test-stack");
    const synth = Testing.synth(stack);
    expect(synth).toHaveResourceWithProperties(Instance, {
      ami: "ami-123456",
      instance_type: "t2.micro",
      vpc_security_group_ids:
        "${flatten([[], aws_security_group.TestInstance-SG.id])}",
    });
  });
});
