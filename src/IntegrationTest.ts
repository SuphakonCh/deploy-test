import assert from "node:assert/strict";
import { calculate } from "./Calculator.js";

const result = calculate(6, 3);

assert.deepEqual(result, {
  sum: 10,
  product: 18,
  quotient: 2,
});

console.log("Integration test passed");
