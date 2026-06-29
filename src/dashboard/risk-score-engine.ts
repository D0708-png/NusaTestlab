import type { RiskLevel } from "./types.js";

export interface RiskScoreInput {
  total: number;
  failed: number;
  warning: number;
  issues: number;
  criticalIssues?: number;
  highIssues?: number;
  missing?: boolean;
}

export interface RiskScoreResult {
  score: number;
  level: RiskLevel;
}

export class RiskScoreEngine {
  calculate(input: RiskScoreInput): RiskScoreResult {
    if (input.missing) {
      return {
        score: 35,
        level: "medium"
      };
    }

    const failureRatio = input.total > 0 ? input.failed / input.total : 0;
    const warningRatio = input.total > 0 ? input.warning / input.total : 0;

    const score = clamp(
      Math.round(
        failureRatio * 55 +
          warningRatio * 20 +
          input.failed * 8 +
          input.warning * 3 +
          input.issues * 4 +
          (input.highIssues ?? 0) * 10 +
          (input.criticalIssues ?? 0) * 18
      ),
      0,
      100
    );

    return {
      score,
      level: toRiskLevel(score)
    };
  }

  calculateOverall(scores: number[]): RiskScoreResult {
    if (scores.length === 0) {
      return {
        score: 0,
        level: "low"
      };
    }

    const average = scores.reduce((total, score) => total + score, 0) / scores.length;
    const max = Math.max(...scores);
    const score = clamp(Math.round(average * 0.65 + max * 0.35), 0, 100);

    return {
      score,
      level: toRiskLevel(score)
    };
  }
}

function toRiskLevel(score: number): RiskLevel {
  if (score >= 80) {
    return "critical";
  }

  if (score >= 50) {
    return "high";
  }

  if (score >= 20) {
    return "medium";
  }

  return "low";
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
