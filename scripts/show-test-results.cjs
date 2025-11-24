const fs = require("fs");

try {
  const data = fs.readFileSync("test-results/results.json", "utf8");
  const report = JSON.parse(data);

  console.log("--- Test Report Summary ---");
  console.log(`Total Duration: ${(report.stats.duration / 1000).toFixed(2)}s`);
  console.log(
    `StartTime: ${new Date(report.stats.startTime).toLocaleString()}`,
  );

  const failures = [];

  function traverse(suite) {
    if (suite.specs) {
      for (const spec of suite.specs) {
        // Check if any result is 'unexpected' (failed)
        // A spec can have multiple tests (projects) and multiple results (retries)
        // We care if the *final* outcome is not 'expected'

        // Actually, let's look at spec.tests
        for (const test of spec.tests) {
          // test.results is an array of runs
          const lastResult = test.results[test.results.length - 1];
          if (
            lastResult.status !== "passed" &&
            lastResult.status !== "skipped"
          ) {
            failures.push({
              file: spec.file,
              title: spec.title,
              status: lastResult.status,
              error: lastResult.error
                ? lastResult.error.message
                : "Unknown error",
            });
          }
        }
      }
    }
    if (suite.suites) {
      for (const child of suite.suites) {
        traverse(child);
      }
    }
  }

  traverse(report.suites[0]); // Root suite

  console.log(`\nFound ${failures.length} failing tests.`);

  let passedCount = 0;
  function countPassed(suite) {
    if (suite.specs) {
      for (const spec of suite.specs) {
        for (const test of spec.tests) {
          const lastResult = test.results[test.results.length - 1];
          if (lastResult.status === "passed") {
            passedCount++;
          }
        }
      }
    }
    if (suite.suites) {
      for (const child of suite.suites) {
        countPassed(child);
      }
    }
  }
  report.suites.forEach((suite) => traverse(suite));
  report.suites.forEach((suite) => countPassed(suite));
  console.log(`Found ${passedCount} passing tests.`);

  failures.forEach((f, i) => {
    console.log(`\n${i + 1}. [${f.status.toUpperCase()}] ${f.title}`);
    console.log(`   File: ${f.file}`);
    console.log(`   Error: ${f.error.split("\n")[0]}`); // Print first line of error
  });
} catch (err) {
  console.error("Error parsing report:", err);
}
