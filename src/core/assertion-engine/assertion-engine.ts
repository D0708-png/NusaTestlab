import { isDeepStrictEqual } from "node:util";
import type { AssertionStep, TestStepResult } from "../types.js";

export class AssertionEngine {
  run(step: AssertionStep): TestStepResult {
    const startedAt = Date.now();

    try {
      const passed = this.evaluate(step);
      const durationMs = Date.now() - startedAt;

      return {
        stepId: step.id,
        name: step.name,
        type: step.type,
        status: passed ? "passed" : "failed",
        operator: step.operator,
        expected: step.expected,
        actual: step.actual,
        message: step.message,
        error: passed ? undefined : this.createFailureMessage(step),
        durationMs
      };
    } catch (error) {
      const durationMs = Date.now() - startedAt;
      const message = error instanceof Error ? error.message : String(error);

      return {
        stepId: step.id,
        name: step.name,
        type: step.type,
        status: "failed",
        operator: step.operator,
        expected: step.expected,
        actual: step.actual,
        message: step.message,
        error: message,
        durationMs
      };
    }
  }

  private evaluate(step: AssertionStep): boolean {
    switch (step.operator) {
      case "equals":
        return isDeepStrictEqual(step.actual, step.expected);

      case "notEquals":
        return !isDeepStrictEqual(step.actual, step.expected);

      case "contains":
        return this.contains(step.actual, step.expected);

      case "notContains":
        return !this.contains(step.actual, step.expected);

      case "greaterThan": {
        const [actual, expected] = this.toComparableNumbers(step.actual, step.expected);
        return actual > expected;
      }

      case "greaterThanOrEqual": {
        const [actual, expected] = this.toComparableNumbers(step.actual, step.expected);
        return actual >= expected;
      }

      case "lessThan": {
        const [actual, expected] = this.toComparableNumbers(step.actual, step.expected);
        return actual < expected;
      }

      case "lessThanOrEqual": {
        const [actual, expected] = this.toComparableNumbers(step.actual, step.expected);
        return actual <= expected;
      }

      case "isTrue":
        return step.actual === true;

      case "isFalse":
        return step.actual === false;

      case "exists":
        return step.actual !== undefined && step.actual !== null;

      case "notExists":
        return step.actual === undefined || step.actual === null;

      case "matchesRegex":
        return this.matchesRegex(step.actual, step.expected);

      default:
        return false;
    }
  }

  private contains(actual: unknown, expected: unknown): boolean {
    if (typeof actual === "string") {
      return actual.includes(String(expected));
    }

    if (Array.isArray(actual)) {
      return actual.some((item) => isDeepStrictEqual(item, expected));
    }

    if (actual && typeof actual === "object") {
      return Object.values(actual as Record<string, unknown>).some((value) =>
        isDeepStrictEqual(value, expected)
      );
    }

    return false;
  }

  private matchesRegex(actual: unknown, expected: unknown): boolean {
    if (typeof actual !== "string") {
      throw new Error("matchesRegex requires actual value to be a string.");
    }

    if (typeof expected !== "string") {
      throw new Error("matchesRegex requires expected value to be a regex string.");
    }

    return new RegExp(expected).test(actual);
  }

  private toComparableNumbers(actual: unknown, expected: unknown): [number, number] {
    const actualNumber = Number(actual);
    const expectedNumber = Number(expected);

    if (Number.isNaN(actualNumber) || Number.isNaN(expectedNumber)) {
      throw new Error("Numeric assertion requires actual and expected values to be numbers.");
    }

    return [actualNumber, expectedNumber];
  }

  private createFailureMessage(step: AssertionStep): string {
    return `Assertion failed. Operator: ${step.operator}. Expected: ${this.formatValue(
      step.expected
    )}. Actual: ${this.formatValue(step.actual)}.`;
  }

  private formatValue(value: unknown): string {
    try {
      return JSON.stringify(value) ?? String(value);
    } catch {
      return String(value);
    }
  }
}
