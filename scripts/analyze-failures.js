import fs from "fs";

try {
  const data = fs.readFileSync("test-results/results.json", "utf8");
  const results = JSON.parse(data);

  console.log(`Total Tests: ${results.stats.expected}`);
  console.log(`Passed: ${results.stats.expected - results.stats.unexpected}`);
  console.log(`Failed: ${results.stats.unexpected}`);
  console.log(`Skipped: ${results.stats.skipped}`);
  console.log("\n--- FAILED TESTS ---\n");

  results.suites.forEach((suite) => {
    processSuite(suite);
  });

  function processSuite(suite) {
    if (suite.specs) {
      suite.specs.forEach((spec) => {
        spec.tests.forEach((test) => {
          if (test.status === "unexpected" || test.status === "failed") {
            console.log(`FILE: ${spec.file}`);
            console.log(`TEST: ${spec.title}`);
            if (test.results && test.results.length > 0) {
              const error = test.results[0].error;
              if (error) {
                console.log(
                  `ERROR: ${error.message ? error.message.split("\n")[0] : "No message"}`,
                );
              }
            }
            console.log("-----------------------------------");
          }
        });
      });
    }

    if (suite.suites) {
      suite.suites.forEach((childSuite) => {
        processSuite(childSuite);
      });
    }
  }
} catch (err) {
  console.error("Error reading or parsing results.json:", err);
}
