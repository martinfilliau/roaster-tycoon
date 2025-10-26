// Simple test framework
function assert(condition, message) {
  if (!condition) {
    throw new Error(`❌ Test failed: ${message}`);
  }
  return true;
}

function assertEquals(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(
      `❌ Test failed: ${message}\n  Expected: ${expected}\n  Actual: ${actual}`,
    );
  }
  return true;
}

function test(description, fn) {
  try {
    fn();
    console.log(`✅ ${description}`);
    return true;
  } catch (error) {
    console.error(`❌ ${description}`);
    console.error(`   ${error.message}`);
    return false;
  }
}

// Import functions (when running in Node.js)
let formatTime, calculateDevelopmentPercentage, calculateDevelopmentTime;

if (typeof require !== "undefined") {
  const timer = require("./timer.js");
  formatTime = timer.formatTime;
  calculateDevelopmentPercentage = timer.calculateDevelopmentPercentage;
  calculateDevelopmentTime = timer.calculateDevelopmentTime;
}

// Test Suite
function runTests() {
  console.log("\n🧪 Running Timer Tests\n");

  let passed = 0;
  let failed = 0;

  // Tests for formatTime
  if (
    test("formatTime: formats 0 seconds correctly", () => {
      assertEquals(formatTime(0), "00:00", "Should format 0 as 00:00");
    })
  )
    passed++;
  else failed++;

  if (
    test("formatTime: formats seconds only", () => {
      assertEquals(
        formatTime(45),
        "00:45",
        "Should format 45 seconds as 00:45",
      );
    })
  )
    passed++;
  else failed++;

  if (
    test("formatTime: formats minutes and seconds", () => {
      assertEquals(
        formatTime(125),
        "02:05",
        "Should format 125 seconds as 02:05",
      );
    })
  )
    passed++;
  else failed++;

  if (
    test("formatTime: formats exact minutes", () => {
      assertEquals(
        formatTime(300),
        "05:00",
        "Should format 300 seconds as 05:00",
      );
    })
  )
    passed++;
  else failed++;

  if (
    test("formatTime: handles large values", () => {
      assertEquals(
        formatTime(3661),
        "61:01",
        "Should format 3661 seconds as 61:01",
      );
    })
  )
    passed++;
  else failed++;

  // Tests for calculateDevelopmentTime
  if (
    test("calculateDevelopmentTime: returns 0 when crack time is null", () => {
      assertEquals(
        calculateDevelopmentTime(100, null),
        0,
        "Should return 0 when crack time is null",
      );
    })
  )
    passed++;
  else failed++;

  if (
    test("calculateDevelopmentTime: returns 0 when crack time is undefined", () => {
      assertEquals(
        calculateDevelopmentTime(100, undefined),
        0,
        "Should return 0 when crack time is undefined",
      );
    })
  )
    passed++;
  else failed++;

  if (
    test("calculateDevelopmentTime: calculates correct development time", () => {
      assertEquals(
        calculateDevelopmentTime(720, 540),
        180,
        "Should calculate 180 seconds of development (12min total, 9min crack)",
      );
    })
  )
    passed++;
  else failed++;

  if (
    test("calculateDevelopmentTime: handles zero development time", () => {
      assertEquals(
        calculateDevelopmentTime(540, 540),
        0,
        "Should return 0 when crack just happened",
      );
    })
  )
    passed++;
  else failed++;

  // Tests for calculateDevelopmentPercentage
  if (
    test("calculateDevelopmentPercentage: returns 0 for zero target", () => {
      assertEquals(
        calculateDevelopmentPercentage(100, 0),
        0,
        "Should return 0 when target is 0",
      );
    })
  )
    passed++;
  else failed++;

  if (
    test("calculateDevelopmentPercentage: returns 0 for negative target", () => {
      assertEquals(
        calculateDevelopmentPercentage(100, -5),
        0,
        "Should return 0 when target is negative",
      );
    })
  )
    passed++;
  else failed++;

  if (
    test("calculateDevelopmentPercentage: calculates 20% correctly", () => {
      // 2.4 minutes development out of 12 minutes total = 20%
      const devSeconds = 144; // 2.4 minutes
      const targetMinutes = 12;
      const result = calculateDevelopmentPercentage(devSeconds, targetMinutes);
      assertEquals(result, 20, "Should calculate 20% for 2.4min/12min");
    })
  )
    passed++;
  else failed++;

  if (
    test("calculateDevelopmentPercentage: calculates 25% correctly", () => {
      // 3 minutes development out of 12 minutes total = 25%
      const devSeconds = 180; // 3 minutes
      const targetMinutes = 12;
      const result = calculateDevelopmentPercentage(devSeconds, targetMinutes);
      assertEquals(result, 25, "Should calculate 25% for 3min/12min");
    })
  )
    passed++;
  else failed++;

  if (
    test("calculateDevelopmentPercentage: calculates 15% correctly", () => {
      // 1.8 minutes development out of 12 minutes total = 15%
      const devSeconds = 108; // 1.8 minutes
      const targetMinutes = 12;
      const result = calculateDevelopmentPercentage(devSeconds, targetMinutes);
      assertEquals(result, 15, "Should calculate 15% for 1.8min/12min");
    })
  )
    passed++;
  else failed++;

  if (
    test("calculateDevelopmentPercentage: handles fractional target times", () => {
      // 1.5 minutes development out of 10.5 minutes total ≈ 14.29%
      const devSeconds = 90; // 1.5 minutes
      const targetMinutes = 10.5;
      const result = calculateDevelopmentPercentage(devSeconds, targetMinutes);
      const expected = (90 / (10.5 * 60)) * 100;
      assert(
        Math.abs(result - expected) < 0.01,
        `Should calculate percentage for fractional target (expected ~${expected.toFixed(2)}%, got ${result.toFixed(2)}%)`,
      );
    })
  )
    passed++;
  else failed++;

  if (
    test("calculateDevelopmentPercentage: handles 100% development", () => {
      // Development time equals total time
      const devSeconds = 600; // 10 minutes
      const targetMinutes = 10;
      const result = calculateDevelopmentPercentage(devSeconds, targetMinutes);
      assertEquals(
        result,
        100,
        "Should calculate 100% when development equals target",
      );
    })
  )
    passed++;
  else failed++;

  if (
    test("calculateDevelopmentPercentage: handles over 100% development", () => {
      // Development time exceeds total time (edge case)
      const devSeconds = 720; // 12 minutes
      const targetMinutes = 10;
      const result = calculateDevelopmentPercentage(devSeconds, targetMinutes);
      assertEquals(
        result,
        120,
        "Should calculate 120% when development exceeds target",
      );
    })
  )
    passed++;
  else failed++;

  // Integration test
  if (
    test("Integration: typical roast scenario", () => {
      // Scenario: 12 minute roast, first crack at 9 minutes
      const totalTime = 720; // 12 minutes
      const crackTime = 540; // 9 minutes
      const targetMinutes = 12;

      const devTime = calculateDevelopmentTime(totalTime, crackTime);
      assertEquals(
        devTime,
        180,
        "Development time should be 180 seconds (3 minutes)",
      );

      const devPercent = calculateDevelopmentPercentage(devTime, targetMinutes);
      assertEquals(devPercent, 25, "Development percentage should be 25%");

      const formattedTotal = formatTime(totalTime);
      assertEquals(
        formattedTotal,
        "12:00",
        "Total time should format as 12:00",
      );

      const formattedCrack = formatTime(crackTime);
      assertEquals(
        formattedCrack,
        "09:00",
        "Crack time should format as 09:00",
      );

      const formattedDev = formatTime(devTime);
      assertEquals(
        formattedDev,
        "03:00",
        "Development time should format as 03:00",
      );
    })
  )
    passed++;
  else failed++;

  // Summary
  console.log(`\n${"=".repeat(50)}`);
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  console.log(`${"=".repeat(50)}\n`);

  return failed === 0;
}

// Run tests if executed directly
if (typeof require !== "undefined" && require.main === module) {
  const success = runTests();
  process.exit(success ? 0 : 1);
}

// Export for use in other test runners
if (typeof module !== "undefined" && module.exports) {
  module.exports = { runTests };
}
