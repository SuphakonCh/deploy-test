"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const Calculator_js_1 = require("./Calculator.js");
const result = (0, Calculator_js_1.calculate)(6, 3);

strict_1.default.deepEqual(result, {
    sum: 9,
    product: 18,
    quotient: 2,
});
console.log("Integration test passed");
