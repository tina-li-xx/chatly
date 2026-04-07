import { findErrorAlertCoverageProblems } from "../../../scripts/error-alert-coverage.mjs";

describe("error alert coverage", () => {
  it("keeps server entry points on the shared alerting path", async () => {
    await expect(findErrorAlertCoverageProblems(process.cwd())).resolves.toEqual([]);
  });
});
