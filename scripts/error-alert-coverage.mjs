import { readdir, readFile } from "node:fs/promises";
import { basename, join, relative } from "node:path";

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"];
const SERVER_ACTION_WRAPPERS = [
  "withServerActionErrorAlerting",
  "wrapAuthAction",
  "wrapPasswordAction"
];

async function walkFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        return walkFiles(fullPath);
      }

      return fullPath;
    })
  );

  return files.flat();
}

function listMatches(content, pattern) {
  return [...content.matchAll(pattern)].map((match) => match[1]);
}

function formatPath(rootDir, filePath) {
  return relative(rootDir, filePath) || filePath;
}

function validateRouteFile(rootDir, filePath, content) {
  const exportedMethods = listMatches(
    content,
    new RegExp(`export\\s+(?:const\\s+|async\\s+function\\s+|function\\s+)(${HTTP_METHODS.join("|")})\\b`, "g")
  );
  const wrappedMethods = new Set(
    listMatches(
      content,
      new RegExp(`export\\s+const\\s+(${HTTP_METHODS.join("|")})\\s*=\\s*withRouteErrorAlerting\\(`, "g")
    )
  );
  const label = formatPath(rootDir, filePath);
  const problems = [];

  if (!content.includes("withRouteErrorAlerting")) {
    problems.push(`${label}: missing withRouteErrorAlerting import/usage`);
  }

  for (const method of exportedMethods) {
    if (!wrappedMethods.has(method)) {
      problems.push(`${label}: ${method} is not wrapped with withRouteErrorAlerting`);
    }
  }

  return problems;
}

function validateServerActionFile(rootDir, filePath, content) {
  if (!/^\s*["']use server["'];/m.test(content)) {
    return [];
  }

  const exportedAsyncFunctions = listMatches(content, /export\s+async\s+function\s+([A-Za-z0-9_]+)\s*\(/g);
  const exportedConstActions = listMatches(content, /export\s+const\s+([A-Za-z0-9_]+)\s*=/g);
  const wrappedConstActions = new Set(
    listMatches(
      content,
      new RegExp(
        `export\\s+const\\s+([A-Za-z0-9_]+)\\s*=\\s*(?:${SERVER_ACTION_WRAPPERS.join("|")})\\(`,
        "g"
      )
    )
  );
  const label = formatPath(rootDir, filePath);
  const problems = [];

  if (!SERVER_ACTION_WRAPPERS.some((wrapperName) => content.includes(wrapperName))) {
    problems.push(`${label}: missing approved server-action wrapper usage`);
  }

  for (const actionName of exportedAsyncFunctions) {
    problems.push(`${label}: exported server action ${actionName} must be wrapped with withServerActionErrorAlerting`);
  }

  for (const actionName of exportedConstActions) {
    if (!wrappedConstActions.has(actionName)) {
      problems.push(`${label}: exported server action ${actionName} must use an approved server-action wrapper`);
    }
  }

  return problems;
}

function validateRuntimeFile(rootDir, filePath, content) {
  if (basename(filePath) === "interval-scheduler.ts" || !content.includes("setInterval(")) {
    return [];
  }

  return [
    `${formatPath(rootDir, filePath)}: raw setInterval is not allowed in src/lib/runtime outside interval-scheduler.ts`
  ];
}

export async function findErrorAlertCoverageProblems(rootDir) {
  const appFiles = await walkFiles(join(rootDir, "app"));
  const srcFiles = await walkFiles(join(rootDir, "src"));
  const routeFiles = appFiles.filter((filePath) => /\/route\.(ts|tsx)$/.test(filePath));
  const sourceFiles = [...new Set([...appFiles, ...srcFiles])].filter((filePath) => /\.(ts|tsx)$/.test(filePath));
  const problems = [];

  for (const filePath of sourceFiles) {
    const content = await readFile(filePath, "utf8");

    if (routeFiles.includes(filePath)) {
      problems.push(...validateRouteFile(rootDir, filePath, content));
    }

    problems.push(...validateServerActionFile(rootDir, filePath, content));

    if (filePath.startsWith(join(rootDir, "src", "lib", "runtime"))) {
      problems.push(...validateRuntimeFile(rootDir, filePath, content));
    }
  }

  return problems.sort();
}
