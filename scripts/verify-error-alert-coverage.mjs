import { findErrorAlertCoverageProblems } from "./error-alert-coverage.mjs";

const problems = await findErrorAlertCoverageProblems(process.cwd());

if (!problems.length) {
  process.exit(0);
}

console.error("Error alert coverage verification failed:");
for (const problem of problems) {
  console.error(`- ${problem}`);
}

process.exit(1);
