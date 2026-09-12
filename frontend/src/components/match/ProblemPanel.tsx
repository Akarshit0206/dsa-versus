import { useState } from 'react';
import { BookOpen, Copy, Check, Hash, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PublicQuestion } from '@/types';

interface ProblemPanelProps {
  question?: PublicQuestion;
  questionIndex: number;
}

export function ProblemPanel({ question, questionIndex }: ProblemPanelProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!question) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
        No problem selected.
      </div>
    );
  }

  const difficultyVariant =
    question.difficulty === 'EASY'
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
      : question.difficulty === 'MEDIUM'
      ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
      : 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400';

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-card/40 p-5 sm:p-6 text-ink">
      {/* Question Header */}
      <div className="border-b border-border/80 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-bold text-muted-foreground">
            #{questionIndex + 1}
          </span>
          <span
            className={cn(
              'rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase',
              difficultyVariant
            )}
          >
            {question.difficulty}
          </span>
          {question.topics?.map((topic) => (
            <span
              key={topic}
              className="rounded-full border border-border bg-secondary/70 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
            >
              {topic}
            </span>
          ))}
        </div>

        <h2 className="mt-3 text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
          {question.title}
        </h2>
      </div>

      {/* Problem Description */}
      <div className="mt-5 space-y-4 text-sm leading-relaxed text-ink/90">
        <div className="whitespace-pre-line font-sans">
          {question.description}
        </div>
      </div>

      {/* Examples / Sample Test Cases */}
      {question.testCases && question.testCases.length > 0 && (
        <div className="mt-8 space-y-4">
          <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Sparkles className="size-3.5 text-marker" />
            Examples
          </h3>

          <div className="space-y-4">
            {question.testCases.map((tc, idx) => {
              const inputKey = `example-in-${idx}`;
              const outputKey = `example-out-${idx}`;

              return (
                <div
                  key={idx}
                  className="rounded-xl border border-border bg-background/60 p-4 shadow-xs"
                >
                  <div className="mb-2 flex items-center justify-between text-xs font-bold text-ink">
                    <span>Example {idx + 1}</span>
                  </div>

                  <div className="space-y-2 font-mono text-xs">
                    {/* Input */}
                    <div className="group/item relative rounded-lg border border-border/70 bg-secondary/50 p-2.5">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                        <span className="font-sans font-bold">Input:</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(tc.input, inputKey)}
                          className="opacity-0 group-hover/item:opacity-100 transition-opacity text-muted-foreground hover:text-ink"
                          title="Copy input"
                        >
                          {copiedKey === inputKey ? (
                            <Check className="size-3 text-emerald-500" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </div>
                      <code className="text-ink break-all">{tc.input}</code>
                    </div>

                    {/* Output */}
                    <div className="group/item relative rounded-lg border border-border/70 bg-secondary/50 p-2.5">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                        <span className="font-sans font-bold">Output:</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(tc.output, outputKey)}
                          className="opacity-0 group-hover/item:opacity-100 transition-opacity text-muted-foreground hover:text-ink"
                          title="Copy output"
                        >
                          {copiedKey === outputKey ? (
                            <Check className="size-3 text-emerald-500" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </div>
                      <code className="text-ink break-all">{tc.output}</code>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Constraints Block */}
      {question.constraints && question.constraints.length > 0 && (
        <div className="mt-8 mb-6">
          <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            <Hash className="size-3.5 text-marker" />
            Constraints
          </h3>
          <ul className="space-y-1.5 rounded-xl border border-border bg-background/50 p-4 font-mono text-xs text-ink">
            {question.constraints.map((constraint, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-marker" />
                <span className="break-all">{constraint}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
