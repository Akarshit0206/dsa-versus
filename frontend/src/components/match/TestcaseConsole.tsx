import { useState } from 'react';
import {
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PublicTestCase } from '@/types';

export interface TestCaseItem {
  id: string;
  input: string;
  output?: string;
  isCustom: boolean;
}

export interface RunResult {
  status: 'PENDING' | 'ACCEPTED' | 'WRONG ANSWER' | 'RUNTIME ERROR' | 'TLE';
  totalCount: number;
  passedCount: number;
  details?: {
    caseIndex: number;
    passed: boolean;
    stdout?: string;
    actualOutput?: string;
    expectedOutput?: string;
    time?: number;
  }[];
}

interface TestcaseConsoleProps {
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

export function TestcaseConsole({
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

  const canAddMore = testCases.length < MAX_TOTAL_TEST_CASES;

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

  const currentCase = testCases[activeCaseIndex] || testCases[0];

  return (
    <div className="flex h-full flex-col bg-card/60 text-ink">
      {/* Console Nav Tabs: Testcase vs Test Result */}
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
            <Terminal className="size-3" />
            <span>Testcases ({testCases.length}/{MAX_TOTAL_TEST_CASES})</span>
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
            {/* Case selector pills + Add button */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-border/60 pb-3">
              {testCases.map((tc, idx) => {
                const isSelected = idx === activeCaseIndex;
                return (
                  <div
                    key={tc.id}
                    className={cn(
                      'group flex items-center rounded-lg border text-xs font-semibold transition-all',
                      isSelected
                        ? 'border-ink bg-ink text-background'
                        : 'border-border bg-background/60 text-muted-foreground hover:bg-background hover:text-ink'
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectCase(idx)}
                      className="px-2.5 py-1"
                    >
                      Case {idx + 1}
                      {tc.isCustom && ' *'}
                    </button>

                    {tc.isCustom && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCustomCase(tc.id);
                        }}
                        className={cn(
                          'pr-1.5 opacity-60 hover:opacity-100 transition-opacity',
                          isSelected ? 'text-background' : 'text-muted-foreground hover:text-destructive'
                        )}
                        title="Delete custom test case"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Add Custom Testcase Button */}
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
                title={canAddMore ? 'Add custom testcase' : 'Max 5 testcases reached'}
                aria-label="Add custom testcase"
              >
                <Plus className="size-3.5" />
              </button>
            </div>

            {/* Selected Testcase View / Editor */}
            {currentCase && (
              <div className="mt-4 space-y-4 font-mono">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-sans font-bold text-muted-foreground mb-1.5">
                    <span>
                      Input {currentCase.isCustom ? '(Editable Custom Input)' : ''}:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(currentCase.input, 'current-in')}
                      className="text-muted-foreground hover:text-ink"
                      title="Copy input"
                    >
                      {copiedKey === 'current-in' ? (
                        <Check className="size-3 text-emerald-500" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </button>
                  </div>

                  {currentCase.isCustom ? (
                    <textarea
                      value={currentCase.input}
                      onChange={(e) => onUpdateCustomInput(activeCaseIndex, e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-border bg-background/80 p-2.5 text-xs text-ink outline-none focus:border-marker transition-colors resize-none"
                      placeholder='e.g. {"gain": [-5, 1, 5, 0, -7]}'
                    />
                  ) : (
                    <pre className="w-full rounded-lg border border-border/80 bg-background/70 p-2.5 text-xs text-ink overflow-x-auto whitespace-pre-wrap break-all">
                      {currentCase.input}
                    </pre>
                  )}
                </div>

                {currentCase.output !== undefined && (
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-sans font-bold text-muted-foreground mb-1.5">
                      <span>Expected Output:</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(currentCase.output || '', 'current-out')}
                        className="text-muted-foreground hover:text-ink"
                        title="Copy expected output"
                      >
                        {copiedKey === 'current-out' ? (
                          <Check className="size-3 text-emerald-500" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                      </button>
                    </div>
                    <pre className="w-full rounded-lg border border-border/80 bg-background/70 p-2.5 text-xs text-ink overflow-x-auto whitespace-pre-wrap break-all">
                      {currentCase.output}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Test Result Tab */
          <div>
            {isRunning ? (
              <div className="flex h-32 flex-col items-center justify-center gap-2 text-muted-foreground">
                <Clock className="size-6 animate-spin text-marker" />
                <p>Executing test cases...</p>
              </div>
            ) : runResult ? (
              <div className="space-y-4">
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

                {/* Case breakdown if details present */}
                {runResult.details && runResult.details.length > 0 && (
                  <div className="space-y-2">
                    {runResult.details.map((d, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-border bg-background/60 p-3 font-mono text-xs"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold font-sans">Testcase {i + 1}</span>
                          <span
                            className={cn(
                              'font-bold',
                              d.passed ? 'text-emerald-500' : 'text-destructive'
                            )}
                          >
                            {d.passed ? 'Passed' : 'Failed'}
                          </span>
                        </div>
                        {d.actualOutput !== undefined && (
                          <div className="text-muted-foreground mt-1">
                            Output: <span className="text-ink">{d.actualOutput}</span>
                          </div>
                        )}
                        {d.expectedOutput !== undefined && (
                          <div className="text-muted-foreground">
                            Expected: <span className="text-ink">{d.expectedOutput}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-32 flex-col items-center justify-center text-muted-foreground">
                <p>Run your code to evaluate against sample test cases.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
