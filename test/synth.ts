import { App, TerraformStack, Testing } from "cdktf";
import { IConstruct } from "constructs";

export function synthTestStack(
  testConstructor: (scope: IConstruct) => void,
): string {
  const app = Testing.app();
  class TestStack extends TerraformStack {
    constructor(scope: App, id: string) {
      super(scope, id);
      testConstructor(this);
    }
  }
  const testStack = new TestStack(app, "test-stack");
  return Testing.synth(testStack);
}
