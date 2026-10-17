import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import { CodeDriverService } from "./CodeDriverService.js";

/**
 * Piston Code Execution Service
 * Handles code compilation and evaluation against test cases using local runtimes
 * (Python 3, Java OpenJDK, G++) with automatic fallback to remote Piston instance when configured.
 */

export interface PistonFile {
  name?: string;
  content: string;
}

export interface PistonExecutePayload {
  language: string;
  version?: string;
  files: PistonFile[];
  stdin?: string;
  args?: string[];
  run_timeout?: number;
  compile_timeout?: number;
}

export interface PistonStageResult {
  stdout: string;
  stderr: string;
  output: string;
  code: number;
  signal: string | null;
}

export interface PistonResponse {
  language: string;
  version: string;
  run: PistonStageResult;
  compile?: PistonStageResult;
  message?: string;
}

export type Verdict =
  | "PENDING"
  | "ACCEPTED"
  | "WRONG ANSWER"
  | "TLE"
  | "MLE"
  | "STACK OVERFLOW"
  | "COMPILATION ERROR"
  | "RUNTIME ERROR"
  | "INTERNAL ERROR";

export interface TestCaseEvaluation {
  caseIndex: number;
  isSample: boolean;
  input: string;
  expectedOutput?: string;
  actualOutput?: string;
  passed: boolean;
  verdict: Verdict;
  time?: number; // in seconds
  memory?: number; // in KB
  stderr?: string;
  compileOutput?: string;
}

export interface BatchEvaluationResult {
  verdict: Verdict;
  passedCount: number;
  totalCount: number;
  executionTime: number; // in seconds
  memory: number; // in KB
  details: TestCaseEvaluation[];
  failedTestCase?: TestCaseEvaluation;
}

export class PistonService {
  private static apiUrl =
    process.env.PISTON_API_URL?.replace(/\/$/, "") || "https://emkc.org/api/v2/piston";

  /**
   * Maps numeric language IDs (71: Python, 54: C++, 62: Java) or language names to Piston language specifiers
   */
  public static mapLanguage(lang: number | string): { language: string; version: string } {
    const stringId = String(lang).toLowerCase();

    if (stringId === "71" || stringId === "python" || stringId === "py") {
      return { language: "python", version: "3.10.0" };
    }
    if (stringId === "54" || stringId === "cpp" || stringId === "c++") {
      return { language: "c++", version: "10.2.0" };
    }
    if (stringId === "62" || stringId === "java") {
      return { language: "java", version: "15.0.2" };
    }

    return { language: "python", version: "3.10.0" };
  }

  /**
   * Normalize strings for output comparison
   */
  public static normalizeOutput(raw?: string | null): string {
    if (!raw) return "";
    return raw
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .trim();
  }

  /**
   * Compares actual output against expected output with tolerance for:
   * 1. Trailing whitespace and newline differences
   * 2. Boolean capitalization ("true" vs "True")
   * 3. Equivalent JSON structures (spacing/formatting differences)
   * 4. Floating point numbers within 1e-5 epsilon
   */
  public static compareOutputs(actualRaw?: string | null, expectedRaw?: string | null): boolean {
    if (CodeDriverService.isEqualOutput(actualRaw, expectedRaw)) {
      return true;
    }

    const actual = this.normalizeOutput(actualRaw);
    const expected = this.normalizeOutput(expectedRaw);

    // Number / Floating point tolerance fallback
    const actualNum = Number(actual);
    const expectedNum = Number(expected);
    if (!isNaN(actualNum) && !isNaN(expectedNum)) {
      if (Math.abs(actualNum - expectedNum) < 1e-5) {
        return true;
      }
    }

    return false;
  }

  /**
   * Resolves the complete execution endpoint URL
   */
  private static getExecuteUrl(): string {
    if (this.apiUrl.endsWith("/execute")) {
      return this.apiUrl;
    }
    if (this.apiUrl.endsWith("/api/v2")) {
      return `${this.apiUrl}/execute`;
    }
    return `${this.apiUrl}/execute`;
  }

  /**
   * Executes code locally using system runtimes (Python, Java, G++)
   */
  public static executeLocal(params: {
    sourceCode: string;
    language: string | number;
    stdin?: string;
    runTimeout?: number;
    compileTimeout?: number;
  }): PistonResponse {
    const langInfo = this.mapLanguage(params.language);
    const runTimeout = params.runTimeout || 3000;
    const compileTimeout = params.compileTimeout || 5000;
    const stdin = params.stdin || "";

    // 1. PYTHON
    if (langInfo.language === "python") {
      const tempFile = path.join(os.tmpdir(), `dsa-py-${Date.now()}-${Math.random().toString(36).substring(7)}.py`);
      try {
        fs.writeFileSync(tempFile, params.sourceCode, "utf-8");
        const res = spawnSync("python", ["-u", tempFile], {
          input: stdin,
          timeout: runTimeout,
          encoding: "utf-8",
          maxBuffer: 10 * 1024 * 1024,
        });

        if (res.error) {
          if ((res.error as any).code === "ETIMEDOUT") {
            return {
              language: "python",
              version: "3.x",
              run: {
                stdout: res.stdout || "",
                stderr: "Time Limit Exceeded",
                output: "Time Limit Exceeded",
                code: 124,
                signal: "SIGKILL",
              },
            };
          }
          return {
            language: "python",
            version: "3.x",
            run: {
              stdout: "",
              stderr: res.error.message,
              output: res.error.message,
              code: 1,
              signal: null,
            },
          };
        }

        const isTle = res.signal === "SIGTERM" || res.signal === "SIGKILL" || res.status === 124;
        const code = isTle ? 124 : (res.status ?? 0);
        const stdout = res.stdout || "";
        const stderr = res.stderr || "";

        return {
          language: "python",
          version: "3.x",
          run: {
            stdout,
            stderr,
            output: stderr ? `${stdout}\n${stderr}`.trim() : stdout,
            code,
            signal: isTle ? "SIGKILL" : null,
          },
        };
      } finally {
        try {
          if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
        } catch {}
      }
    }

    // 2. JAVA
    if (langInfo.language === "java") {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "dsa-java-"));
      try {
        // Detect public class name or default to Main
        const classMatch = params.sourceCode.match(/public\s+class\s+([A-Za-z0-9_]+)/);
        const className: string = (classMatch && classMatch[1]) ? classMatch[1] : "Main";
        const javaFile = path.join(tempDir, `${className}.java`);

        fs.writeFileSync(javaFile, params.sourceCode, "utf-8");

        // Compile
        const compileRes = spawnSync("javac", [`${className}.java`], {
          cwd: tempDir,
          timeout: compileTimeout,
          encoding: "utf-8",
        });

        if (compileRes.error || (compileRes.status !== 0 && compileRes.status !== null)) {
          const errOutput = compileRes.stderr || compileRes.stdout || compileRes.error?.message || "Compilation failed";
          return {
            language: "java",
            version: "21.x",
            compile: {
              code: compileRes.status ?? 1,
              stderr: errOutput,
              stdout: compileRes.stdout || "",
              output: errOutput,
              signal: null,
            },
            run: {
              code: 1,
              signal: null,
              stdout: "",
              stderr: errOutput,
              output: errOutput,
            },
          };
        }

        // Run
        const runRes = spawnSync("java", ["-cp", ".", className], {
          cwd: tempDir,
          input: stdin,
          timeout: runTimeout,
          encoding: "utf-8",
          maxBuffer: 10 * 1024 * 1024,
        });

        if (runRes.error && (runRes.error as any).code === "ETIMEDOUT") {
          return {
            language: "java",
            version: "21.x",
            run: {
              stdout: runRes.stdout || "",
              stderr: "Time Limit Exceeded",
              output: "Time Limit Exceeded",
              code: 124,
              signal: "SIGKILL",
            },
          };
        }

        const isTle = runRes.signal === "SIGTERM" || runRes.signal === "SIGKILL" || runRes.status === 124;
        const code = isTle ? 124 : (runRes.status ?? 0);
        const stdout = runRes.stdout || "";
        const stderr = runRes.stderr || "";

        return {
          language: "java",
          version: "21.x",
          run: {
            stdout,
            stderr,
            output: stderr ? `${stdout}\n${stderr}`.trim() : stdout,
            code,
            signal: isTle ? "SIGKILL" : null,
          },
        };
      } finally {
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
        } catch {}
      }
    }

    // 3. C++
    if (langInfo.language === "c++") {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "dsa-cpp-"));
      try {
        const cppFile = path.join(tempDir, "solution.cpp");
        const exeFile = path.join(tempDir, process.platform === "win32" ? "solution.exe" : "solution");
        fs.writeFileSync(cppFile, params.sourceCode, "utf-8");

        const compileRes = spawnSync("g++", ["-O2", "-std=c++17", cppFile, "-o", exeFile], {
          cwd: tempDir,
          timeout: compileTimeout,
          encoding: "utf-8",
        });

        if (compileRes.error) {
          const msg = "C++ compiler (g++) is not available on this system. Please use Python 3 or Java, or configure a self-hosted Piston URL.";
          return {
            language: "c++",
            version: "g++",
            compile: {
              code: 1,
              stderr: msg,
              stdout: "",
              output: msg,
              signal: null,
            },
            run: {
              code: 1,
              signal: null,
              stdout: "",
              stderr: msg,
              output: msg,
            },
          };
        }

        if (compileRes.status !== 0) {
          const errOutput = compileRes.stderr || compileRes.stdout || "Compilation failed";
          return {
            language: "c++",
            version: "g++",
            compile: {
              code: compileRes.status ?? 1,
              stderr: errOutput,
              stdout: compileRes.stdout || "",
              output: errOutput,
              signal: null,
            },
            run: {
              code: 1,
              signal: null,
              stdout: "",
              stderr: errOutput,
              output: errOutput,
            },
          };
        }

        const runRes = spawnSync(exeFile, [], {
          cwd: tempDir,
          input: stdin,
          timeout: runTimeout,
          encoding: "utf-8",
          maxBuffer: 10 * 1024 * 1024,
        });

        const isTle = runRes.signal === "SIGTERM" || runRes.signal === "SIGKILL" || runRes.status === 124;
        const code = isTle ? 124 : (runRes.status ?? 0);
        const stdout = runRes.stdout || "";
        const stderr = runRes.stderr || "";

        return {
          language: "c++",
          version: "g++",
          run: {
            stdout,
            stderr,
            output: stderr ? `${stdout}\n${stderr}`.trim() : stdout,
            code,
            signal: isTle ? "SIGKILL" : null,
          },
        };
      } finally {
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
        } catch {}
      }
    }

    return this.executeMock(params);
  }

  private static _hasGpp: boolean | null = null;

  /**
   * Checks whether g++ is installed and available locally
   */
  public static hasLocalGpp(): boolean {
    if (this._hasGpp !== null) return this._hasGpp;
    try {
      const check = spawnSync("g++", ["--version"], { timeout: 1500 });
      this._hasGpp = !check.error && check.status === 0;
    } catch {
      this._hasGpp = false;
    }
    return this._hasGpp;
  }

  /**
   * Executes code remotely via Judge0 CE public API (used when local compilers like g++ are absent)
   */
  public static async executeJudge0Remote(params: {
    sourceCode: string;
    language: string | number;
    stdin?: string;
  }): Promise<PistonResponse> {
    const langId = Number(params.language);
    // 54: C++ (GCC 9.2.0), 62: Java (OpenJDK 13.0.1), 71: Python (3.8.1)
    const judge0LangId =
      langId === 54 || String(params.language).toLowerCase().includes("c++") || String(params.language).toLowerCase() === "cpp"
        ? 54
        : langId === 62 || String(params.language).toLowerCase() === "java"
        ? 62
        : 71;

    const response = await fetch("https://ce.judge0.com/submissions?base64_encoded=false&wait=true", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source_code: params.sourceCode,
        language_id: judge0LangId,
        stdin: params.stdin || "",
      }),
    });

    if (!response.ok) {
      throw new Error(`Judge0 CE returned HTTP ${response.status}`);
    }

    const data: any = await response.json();
    const stdout = data.stdout || "";
    const stderr = data.stderr || "";
    const compileOutput = data.compile_output || "";
    const statusId = data.status?.id;

    // Status 6: Compilation Error
    const isCompileError = statusId === 6 || (compileOutput && !stdout);
    // Status 5: Time Limit Exceeded
    const isTle = statusId === 5;
    // Status 7-12: Runtime Error
    const isRuntimeError = statusId >= 7 && statusId <= 12;

    return {
      language: judge0LangId === 54 ? "c++" : judge0LangId === 62 ? "java" : "python",
      version: "GCC/Judge0",
      compile: isCompileError
        ? {
            code: 1,
            stdout: "",
            stderr: compileOutput,
            output: compileOutput,
            signal: null,
          }
        : undefined,
      run: {
        stdout,
        stderr: stderr || (isCompileError ? compileOutput : ""),
        output: isCompileError ? compileOutput : stderr ? `${stdout}\n${stderr}`.trim() : stdout,
        code: isTle ? 124 : isRuntimeError || isCompileError ? 1 : 0,
        signal: isTle ? "SIGKILL" : null,
      },
    };
  }

  /**
   * Execute code with a single test case input via remote Piston, local runtimes, or remote Judge0
   */
  public static async executeSingle(params: {
    sourceCode: string;
    language: string | number;
    stdin?: string;
    runTimeout?: number;
    compileTimeout?: number;
  }): Promise<PistonResponse> {
    const isMock = process.env.PISTON_MOCK === "true";
    if (isMock) {
      return this.executeMock(params);
    }

    const langInfo = this.mapLanguage(params.language);

    // If language is C++ and local g++ compiler is not installed, route to Judge0 CE
    if (langInfo.language === "c++" && !this.hasLocalGpp()) {
      try {
        return await this.executeJudge0Remote(params);
      } catch (judge0Err: any) {
        console.warn("[PistonService] Judge0 C++ remote fallback error:", judge0Err.message);
      }
    }

    const endpoint = this.getExecuteUrl();
    const isPublicEmkc = endpoint.includes("emkc.org");

    // If endpoint is a custom self-hosted instance (not the deprecated public emkc.org whitelist URL)
    if (!isPublicEmkc) {
      try {
        const payload: PistonExecutePayload = {
          language: langInfo.language,
          version: langInfo.version,
          files: [{ content: params.sourceCode }],
          stdin: params.stdin || "",
          run_timeout: params.runTimeout || 3000,
          compile_timeout: params.compileTimeout || 5000,
        };

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          return (await response.json()) as PistonResponse;
        }

        console.warn(`[PistonService] Remote endpoint HTTP ${response.status}. Falling back to local execution.`);
      } catch (error: any) {
        console.warn("[PistonService] Remote endpoint unreachable. Falling back to local execution:", error.message);
      }
    }

    // Fast local execution via installed compiler/interpreter
    try {
      const localRes = this.executeLocal(params);
      // If C++ failed compilation specifically because g++ was missing, try remote Judge0
      if (
        langInfo.language === "c++" &&
        localRes.compile?.stderr?.includes("C++ compiler (g++) is not available")
      ) {
        return await this.executeJudge0Remote(params);
      }
      return localRes;
    } catch (localErr: any) {
      console.warn("[PistonService] Local execution error, falling back to remote Judge0:", localErr.message);
      try {
        return await this.executeJudge0Remote(params);
      } catch {
        return this.executeMock(params);
      }
    }
  }

  /**
   * Evaluates code across a list of test cases
   */
  public static async evaluateTestCases(params: {
    sourceCode: string;
    languageId: number | string;
    testCases: Array<{ input: string; output?: string; isSample?: boolean }>;
    cpuTimeLimit?: number; // seconds
    slug?: string;
    title?: string;
  }): Promise<BatchEvaluationResult> {
    const { sourceCode, languageId, testCases, cpuTimeLimit = 3, slug, title } = params;

    // Wrap user LeetCode Solution class with driver code if needed
    const executableCode = CodeDriverService.wrapCode({
      sourceCode,
      languageId,
      slug,
      title,
    });

    const evaluations: TestCaseEvaluation[] = [];
    let overallVerdict: Verdict = "ACCEPTED";
    let passedCount = 0;
    let maxTime = 0;
    let firstFailedCase: TestCaseEvaluation | undefined = undefined;

    const runTimeout = Math.floor(cpuTimeLimit * 1000);

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      if (!tc) continue;

      const startTime = Date.now();
      let result: PistonResponse;

      try {
        result = await this.executeSingle({
          sourceCode: executableCode,
          language: languageId,
          stdin: tc.input,
          runTimeout,
        });
      } catch (err: any) {
        result = {
          language: "unknown",
          version: "*",
          run: {
            stdout: "",
            stderr: err.message || "Execution error",
            output: err.message || "Execution error",
            code: 1,
            signal: null,
          },
        };
      }

      const elapsedSec = (Date.now() - startTime) / 1000;
      maxTime = Math.max(maxTime, elapsedSec);

      let verdict: Verdict = "ACCEPTED";
      let compileOutput: string | undefined = undefined;
      let stderr: string | undefined = undefined;
      const actualOutput = this.normalizeOutput(result.run?.stdout || result.run?.output || "");
      const expectedOutput = this.normalizeOutput(tc.output);

      // 1. Check Compilation Failure
      if (result.compile && result.compile.code !== 0) {
        verdict = "COMPILATION ERROR";
        compileOutput = result.compile.stderr || result.compile.output;
      }
      // 2. Check TLE (SIGKILL / timeout)
      else if (
        result.run?.signal === "SIGKILL" ||
        result.run?.signal === "SIGTERM" ||
        result.run?.code === 124 ||
        result.message?.toLowerCase().includes("timed out")
      ) {
        verdict = "TLE";
      }
      // 3. Check Runtime Failure
      else if (result.run && result.run.code !== 0) {
        verdict = "RUNTIME ERROR";
        stderr = result.run.stderr || result.run.output;
      }
      // 4. Check Output Correctness with smart comparison
      else {
        if (this.compareOutputs(actualOutput, expectedOutput)) {
          verdict = "ACCEPTED";
        } else {
          verdict = "WRONG ANSWER";
        }
      }

      const passed = verdict === "ACCEPTED";
      const evaluation: TestCaseEvaluation = {
        caseIndex: i,
        isSample: !!tc.isSample,
        input: tc.input,
        expectedOutput: tc.output,
        actualOutput: result.run?.stdout || "",
        passed,
        verdict,
        time: elapsedSec,
        memory: 15400, // nominal footprint in KB
        stderr,
        compileOutput,
      };

      evaluations.push(evaluation);

      if (passed) {
        passedCount++;
      } else if (!firstFailedCase) {
        firstFailedCase = evaluation;
        overallVerdict = verdict;
      }
    }

    if (passedCount === testCases.length && testCases.length > 0) {
      overallVerdict = "ACCEPTED";
    }

    return {
      verdict: overallVerdict,
      passedCount,
      totalCount: testCases.length,
      executionTime: maxTime,
      memory: 15400,
      details: evaluations,
      failedTestCase: firstFailedCase,
    };
  }

  /**
   * Safe fallback simulation runner
   */
  private static executeMock(params: {
    sourceCode: string;
    language: string | number;
    stdin?: string;
  }): PistonResponse {
    const isError = params.sourceCode.includes("__SYNTAX_ERROR__");

    if (isError) {
      return {
        language: "python",
        version: "3.10.0",
        run: {
          stdout: "",
          stderr: "SyntaxError: invalid syntax",
          output: "SyntaxError: invalid syntax",
          code: 1,
          signal: null,
        },
      };
    }

    return {
      language: "python",
      version: "3.10.0",
      run: {
        stdout: "0\n",
        stderr: "",
        output: "0\n",
        code: 0,
        signal: null,
      },
    };
  }
}
