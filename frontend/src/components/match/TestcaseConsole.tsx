import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Code2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PublicQuestion } from '@/types';
import {
  parseTestCaseInput,
  serializeTestCaseInput,
  type TestCaseParam,
} from '@/utils/testCaseUtils';

export interface TestCaseItem {
  id: string;
  input: string;
  output?: string;
  isCustom: boolean;
}

export interface RunResult {
  status: 'PENDING' | 'ACCEPTED' | 'WRONG ANSWER' | 'RUNTIME ERROR' | 'TLE' | 'COMPILATION ERROR';
  totalCount: number;
  passedCount: number;
  details?: {
    caseIndex: number;
    passed: boolean;
    stdout?: string;
    actualOutput?: string;
    expectedOutput?: string;
    time?: number;
    stderr?: string;
    compileOutput?: string;
  }[];
}

interface TestcaseConsoleProps {
  question?: PublicQuestion;
  testCases: TestCaseItem[];
  activeCaseIndex: number;
  onSelectCase: (index: number) => void;
  onAddCustomCase: () => void;
  onDeleteCustomCase: (id: string) => void;
  onUpdateCustomInput: (index: number, value: string) => void;
  runResult: RunResult | null;
  isRunning: boolean;
}

const MAX_TOTAL_TEST_CASES = 5;
// Custom test cases disabled for now as custom cases lack precomputed server-side expected outputs
const ENABLE_CUSTOM_TEST_CASES = false;

export function TestcaseConsole({
  question,
  testCases,
  activeCaseIndex,
  onSelectCase,
  onAddCustomCase,
  onDeleteCustomCase,
  onUpdateCustomInput,
  runResult,
  isRunning,
}: TestcaseConsoleProps) {
  const [activeTab, setActiveTab] = useState<'testcase' | 'result'>('testcase');
  const [showMaxNotice, setShowMaxNotice] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedResultCaseIndex, setSelectedResultCaseIndex] = useState(0);

  // Local parameter values for smooth, cursor-safe editing of the active test case
  const [localParamValues, setLocalParamValues] = useState<Record<string, string>>({});
  const lastCaseIdRef = useRef<string | null>(null);

  const canAddMore = testCases.length < MAX_TOTAL_TEST_CASES;
  const currentCase = testCases[activeCaseIndex] || testCases[0];

  // Auto-switch to result tab when run starts or results arrive
  useEffect(() => {
    if (isRunning) {
      setActiveTab('result');
      setSelectedResultCaseIndex(0);
    }
  }, [isRunning]);

  useEffect(() => {
    if (runResult) {
      setActiveTab('result');
    }
  }, [runResult]);

  // Parse structured parameters for current case
  const parsedParams: TestCaseParam[] = useMemo(() => {
    if (!currentCase) return [];
    return parseTestCaseInput(currentCase.input, question);
  }, [currentCase?.input, question]);

  // Keep local parameter state synchronized when changing active test cases
  useEffect(() => {
    if (!currentCase) return;

    if (lastCaseIdRef.current !== currentCase.id) {
      const initialMap: Record<string, string> = {};
      parsedParams.forEach((p) => {
        initialMap[p.name] = p.value;
      });
      setLocalParamValues(initialMap);
      lastCaseIdRef.current = currentCase.id;
    }
  }, [currentCase?.id, parsedParams]);

  const handleParamChange = (paramName: string, newValue: string) => {
    const updatedMap = {
      ...localParamValues,
      [paramName]: newValue,
    };
    setLocalParamValues(updatedMap);

    // Reconstruct parameter list preserving existing order
    const updatedParams: TestCaseParam[] = parsedParams.map((p) => ({
      name: p.name,
      value: p.name === paramName ? newValue : updatedMap[p.name] ?? p.value,
    }));

    const serialized = serializeTestCaseInput(updatedParams);
    onUpdateCustomInput(activeCaseIndex, serialized);
  };

  const handleAddClick = () => {
    if (canAddMore) {
      onAddCustomCase();
      setShowMaxNotice(false);
    } else {
      setShowMaxNotice(true);
      setTimeout(() => setShowMaxNotice(false), 3000);
    }
  };

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      // Fallback
    }
  };

  // Result tab: active case detail
  const activeResultDetail = runResult?.details?.[selectedResultCaseIndex];
  const activeResultCase = testCases[selectedResultCaseIndex] || testCases[0];
  const activeResultParams = useMemo(() => {
    if (!activeResultCase) return [];
    return parseTestCaseInput(activeResultCase.input, question);
  }, [activeResultCase?.input, question]);

  return (
    <div className="flex h-full flex-col bg-card/60 text-ink">
      {/* Console Nav Tabs: Testcases vs Result */}
      <div className="flex items-center justify-between border-b border-border/80 bg-background/50 px-3 py-1.5 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('testcase')}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-2.5 py-1 font-semibold transition-colors',
              activeTab === 'testcase'
                ? 'bg-ink text-background shadow-xs'
                : 'text-muted-foreground hover:text-ink'
            )}
          >
            <Code2 className="size-3" />
            <span>
              {ENABLE_CUSTOM_TEST_CASES
                ? `Testcases (${testCases.length}/${MAX_TOTAL_TEST_CASES})`
                : `Testcases (${testCases.length})`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('result')}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-2.5 py-1 font-semibold transition-colors',
              activeTab === 'result'
                ? 'bg-ink text-background shadow-xs'
                : 'text-muted-foreground hover:text-ink'
            )}
          >
            <span>Result</span>
            {runResult && (
              <span
                className={cn(
                  'size-2 rounded-full',
                  runResult.status === 'ACCEPTED' ? 'bg-emerald-500' : 'bg-destructive'
                )}
              />
            )}
          </button>
        </div>

        {/* Max testcase warning badge */}
        {showMaxNotice && (
          <div className="flex items-center gap-1 text-[11px] font-bold text-destructive animate-in fade-in">
            <AlertCircle className="size-3" />
            <span>Maximum {MAX_TOTAL_TEST_CASES} test cases reached</span>
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 text-xs">
        {activeTab === 'testcase' ? (
          <div>
            {/* LeetCode-style Case tabs: Case 1, Case 2, Case 3, + */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-border/60 pb-3">
              {testCases.map((tc, idx) => {
                const isSelected = idx === activeCaseIndex;
                return (
                  <div
                    key={tc.id}
                    className={cn(
                      'group flex items-center rounded-lg text-xs font-semibold transition-all',
                      isSelected
                        ? 'bg-neutral-800 text-neutral-100 dark:bg-neutral-700 dark:text-white shadow-xs'
                        : 'text-muted-foreground hover:bg-secondary/60 hover:text-ink'
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectCase(idx)}
                      className={cn(
                        'px-3 py-1.5 transition-colors',
                        tc.isCustom ? 'pr-1.5' : 'pr-3'
                      )}
                    >
                      Case {idx + 1}
                    </button>

                    {ENABLE_CUSTOM_TEST_CASES && tc.isCustom && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCustomCase(tc.id);
                        }}
                        className="pr-2 pl-0.5 opacity-60 hover:opacity-100 hover:text-destructive transition-opacity"
                        title="Delete custom test case"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Add Custom Testcase Button (Preserved, conditionally hidden while custom testcases are disabled) */}
              {ENABLE_CUSTOM_TEST_CASES && (
                <button
                  type="button"
                  onClick={handleAddClick}
                  disabled={!canAddMore}
                  className={cn(
                    'flex size-7 items-center justify-center rounded-lg border border-dashed transition-colors',
                    canAddMore
                      ? 'border-border text-muted-foreground hover:border-marker/70 hover:bg-secondary hover:text-ink'
                      : 'border-border/40 text-muted-foreground/40 cursor-not-allowed'
                  )}
                  title={canAddMore ? 'Add testcase' : 'Max 5 testcases reached'}
                  aria-label="Add custom testcase"
                >
                  <Plus className="size-3.5" />
                </button>
              )}
            </div>

            {/* LeetCode-style Parameter Fields: param1 = [value], param2 = [value] */}
            {currentCase && (
              <div className="mt-4 space-y-4">
                {parsedParams.map((param, pIdx) => {
                  const currentValue = localParamValues[param.name] ?? param.value;
                  const rowCount = Math.min(6, Math.max(1, currentValue.split('\n').length));

                  return (
                    <div key={param.name || pIdx} className="space-y-1.5">
                      <div className="text-xs font-mono font-medium text-muted-foreground select-none">
                        {param.name} =
                      </div>

                      <div className="group relative rounded-lg border border-border/80 bg-neutral-900/60 dark:bg-[#262626] p-3 transition-colors focus-within:border-marker/80 hover:border-border">
                        <textarea
                          value={currentValue}
                          onChange={(e) => {
                            if (ENABLE_CUSTOM_TEST_CASES) {
                              handleParamChange(param.name, e.target.value);
                            }
                          }}
                          readOnly={!ENABLE_CUSTOM_TEST_CASES}
                          rows={rowCount}
                          className={cn(
                            'w-full bg-transparent font-mono text-xs text-ink dark:text-neutral-100 outline-none resize-none leading-relaxed overflow-x-auto break-all',
                            !ENABLE_CUSTOM_TEST_CASES && 'cursor-default'
                          )}
                          placeholder="Enter parameter value"
                          spellCheck={false}
                        />

                        <button
                          type="button"
                          onClick={() => handleCopy(currentValue, `param-${pIdx}`)}
                          className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-ink"
                          title={`Copy ${param.name}`}
                        >
                          {copiedKey === `param-${pIdx}` ? (
                            <Check className="size-3 text-emerald-500" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Test Result Tab */
          <div>
            {isRunning ? (
              <div className="flex h-36 flex-col items-center justify-center gap-2 text-muted-foreground">
                <Clock className="size-6 animate-spin text-marker" />
                <p className="font-medium text-xs">Executing test cases...</p>
              </div>
            ) : runResult ? (
              <div className="space-y-4">
                {/* Result Status Banner */}
                <div
                  className={cn(
                    'flex items-center justify-between rounded-xl border p-4',
                    runResult.status === 'ACCEPTED'
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'border-destructive/40 bg-destructive/10 text-destructive'
                  )}
                >
                  <div className="flex items-center gap-2">
                    {runResult.status === 'ACCEPTED' ? (
                      <CheckCircle2 className="size-5" />
                    ) : (
                      <XCircle className="size-5" />
                    )}
                    <span className="font-bold text-sm">{runResult.status}</span>
                  </div>

                  <span className="font-mono text-xs font-bold">
                    {runResult.passedCount} / {runResult.totalCount} Test Cases Passed
                  </span>
                </div>

                {/* Case selector pills inside Result view */}
                <div className="flex flex-wrap items-center gap-1.5 border-b border-border/60 pb-3">
                  {testCases.map((_, idx) => {
                    const isSelected = idx === selectedResultCaseIndex;
                    const detail = runResult.details?.[idx];
                    const passed = detail ? detail.passed : runResult.status === 'ACCEPTED';

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedResultCaseIndex(idx)}
                        className={cn(
                          'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                          isSelected
                            ? 'bg-neutral-800 text-neutral-100 dark:bg-neutral-700 dark:text-white shadow-xs'
                            : 'text-muted-foreground hover:bg-secondary/60 hover:text-ink'
                        )}
                      >
                        <span
                          className={cn(
                            'size-1.5 rounded-full',
                            passed ? 'bg-emerald-500' : 'bg-destructive'
                          )}
                        />
                        <span>Case {idx + 1}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Result Case Details in LeetCode Format */}
                <div className="space-y-3.5">
                  {/* Inputs */}
                  {activeResultParams.map((param, pIdx) => (
                    <div key={pIdx} className="space-y-1">
                      <div className="text-xs font-mono font-medium text-muted-foreground select-none">
                        {param.name} =
                      </div>
                      <div className="rounded-lg border border-border/80 bg-neutral-900/60 dark:bg-[#262626] p-2.5 font-mono text-xs text-ink dark:text-neutral-100 break-all overflow-x-auto">
                        {param.value}
                      </div>
                    </div>
                  ))}

                  {/* Actual Output */}
                  {activeResultDetail?.actualOutput !== undefined && (
                    <div className="space-y-1">
                      <div className="text-xs font-mono font-medium text-muted-foreground select-none">
                        Output =
                      </div>
                      <div
                        className={cn(
                          'rounded-lg border p-2.5 font-mono text-xs break-all overflow-x-auto',
                          activeResultDetail.passed
                            ? 'border-border/80 bg-neutral-900/60 dark:bg-[#262626] text-ink dark:text-neutral-100'
                            : 'border-destructive/40 bg-destructive/10 text-destructive'
                        )}
                      >
                        {activeResultDetail.actualOutput || '<empty output>'}
                      </div>
                    </div>
                  )}

                  {/* Expected Output */}
                  {(activeResultDetail?.expectedOutput !== undefined ||
                    activeResultCase?.output !== undefined) && (
                    <div className="space-y-1">
                      <div className="text-xs font-mono font-medium text-muted-foreground select-none">
                        Expected =
                      </div>
                      <div className="rounded-lg border border-border/80 bg-neutral-900/60 dark:bg-[#262626] p-2.5 font-mono text-xs text-ink dark:text-neutral-100 break-all overflow-x-auto">
                        {activeResultDetail?.expectedOutput ?? activeResultCase?.output}
                      </div>
                    </div>
                  )}

                  {/* Stdout if available */}
                  {activeResultDetail?.stdout && (
                    <div className="space-y-1">
                      <div className="text-xs font-mono font-medium text-muted-foreground select-none">
                        Stdout =
                      </div>
                      <div className="rounded-lg border border-border/80 bg-neutral-900/60 dark:bg-[#262626] p-2.5 font-mono text-xs text-muted-foreground break-all overflow-x-auto">
                        {activeResultDetail.stdout}
                      </div>
                    </div>
                  )}

                  {/* Stderr / Compiler Output if available */}
                  {(activeResultDetail?.stderr || activeResultDetail?.compileOutput) && (
                    <div className="space-y-1">
                      <div className="text-xs font-mono font-medium text-destructive select-none">
                        Error / Stderr =
                      </div>
                      <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-2.5 font-mono text-xs text-destructive whitespace-pre-wrap break-all overflow-x-auto">
                        {activeResultDetail.stderr || activeResultDetail.compileOutput}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-36 flex-col items-center justify-center text-muted-foreground">
                <p>Run your code to evaluate against test cases.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
