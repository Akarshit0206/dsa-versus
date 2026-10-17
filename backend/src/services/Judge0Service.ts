/**
 * Re-export PistonService as Judge0Service for backwards compatibility
 */
export {
  PistonService as Judge0Service,
  PistonService,
  type Verdict,
  type TestCaseEvaluation,
  type BatchEvaluationResult,
} from "./PistonService.js";
