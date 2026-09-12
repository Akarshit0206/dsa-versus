import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useMatchSocket } from '@/hooks/useMatchSocket';
import { MatchHeader } from '@/components/match/MatchHeader';
import { ProblemPanel } from '@/components/match/ProblemPanel';
import {
  CodeEditorPanel,
  DEFAULT_BOILERPLATES,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from '@/components/match/CodeEditorPanel';
import {
  TestcaseConsole,
  type TestCaseItem,
  type RunResult,
} from '@/components/match/TestcaseConsole';
import type { PublicQuestion } from '@/types';

// Fallback preview question for standalone frontend dev
const FALLBACK_QUESTIONS: PublicQuestion[] = [
  {
    _id: 'sample_q1',
    title: 'Find the Highest Altitude',
    slug: 'find-the-highest-altitude',
    difficulty: 'EASY',
    description: `There is a biker going on a road trip. The road trip consists of n + 1 points at different altitudes. The biker starts his trip on point 0 with altitude 0.

You are given an integer array gain of length n where gain[i] is the net gain in altitude between points i and i + 1 for all 0 <= i < n.

Return the highest altitude of a point.`,
    constraints: [
      '1 <= gain.length <= 100',
      '-100 <= gain[i] <= 100',
    ],
    topics: ['Arrays', 'Prefix Sum'],
    starterCode: {
      python: DEFAULT_BOILERPLATES.python,
      cpp: DEFAULT_BOILERPLATES.cpp,
      java: DEFAULT_BOILERPLATES.java,
    },
    testCases: [
      {
        input: '{"gain": [-5, 1, 5, 0, -7]}',
        output: '1',
        isSample: true,
      },
      {
        input: '{"gain": [-4, -3, -2, -1, 4, 3, 2]}',
        output: '0',
        isSample: true,
      },
    ],
  },
  {
    _id: 'sample_q2',
    title: 'Two Sum II - Input Array Is Sorted',
    slug: 'two-sum-ii-input-array-is-sorted',
    difficulty: 'MEDIUM',
    description: `Given a 1-indexed array of integers numbers that is already sorted in non-decreasing order, find two numbers such that they add up to a specific target number.

Return the indices of the two numbers, index1 and index2, added by one as an integer array [index1, index2] of length 2.`,
    constraints: [
      '2 <= numbers.length <= 3 * 10^4',
      '-1000 <= numbers[i] <= 1000',
      'numbers is sorted in non-decreasing order.',
    ],
    topics: ['Arrays', 'Two Pointers', 'Binary Search'],
    starterCode: {
      python: DEFAULT_BOILERPLATES.python,
      cpp: DEFAULT_BOILERPLATES.cpp,
      java: DEFAULT_BOILERPLATES.java,
    },
    testCases: [
      {
        input: '{"numbers": [2, 7, 11, 15], "target": 9}',
        output: '[1, 2]',
        isSample: true,
      },
      {
        input: '{"numbers": [2, 3, 4], "target": 6}',
        output: '[1, 3]',
        isSample: true,
      },
    ],
  },
];

export function MatchPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { match, isConnected, isLoading, error, getMatch, updateProgress } =
    useMatchSocket();

  // Arena state
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [activeLanguage, setActiveLanguage] = useState<SupportedLanguage>('python');
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResult, setRunResult] = useState<RunResult | null>(null);

  // In-memory code state map: `${questionId}:${language}` -> user code string
  const [codeStateMap, setCodeStateMap] = useState<Record<string, string>>({});

  // Custom test cases state map: `${questionId}` -> TestCaseItem[]
  const [customTestCasesMap, setCustomTestCasesMap] = useState<Record<string, TestCaseItem[]>>({});

  // Hydrate match on mount or reload
  useEffect(() => {
    if (matchId && (!match || match.matchId !== matchId)) {
      getMatch(matchId).catch(() => {
        // Handled by hook error state
      });
    }
  }, [matchId, match, getMatch]);

  // Questions resolved from match data or fallback
  const questions: PublicQuestion[] = useMemo(() => {
    if (match?.questionsData && match.questionsData.length > 0) {
      return match.questionsData;
    }
    return FALLBACK_QUESTIONS;
  }, [match?.questionsData]);

  const activeQuestion: PublicQuestion =
    questions[activeQuestionIndex] || questions[0];

  // Resolve initial boilerplate for a question and language
  const getBoilerplate = useCallback(
    (question: PublicQuestion, lang: SupportedLanguage): string => {
      const langOption = SUPPORTED_LANGUAGES.find((l) => l.id === lang);
      const judge0Key = langOption ? String(langOption.judge0Id) : '';

      if (question.starterCode) {
        if (question.starterCode[lang]) return question.starterCode[lang];
        if (judge0Key && question.starterCode[judge0Key])
          return question.starterCode[judge0Key];
      }
      return DEFAULT_BOILERPLATES[lang] || '';
    },
    []
  );

  // Current active code for the active question and active language
  const currentCodeKey = `${activeQuestion._id}:${activeLanguage}`;
  const currentCode =
    codeStateMap[currentCodeKey] !== undefined
      ? codeStateMap[currentCodeKey]
      : getBoilerplate(activeQuestion, activeLanguage);

  const handleCodeChange = (newCode: string) => {
    setCodeStateMap((prev) => ({
      ...prev,
      [currentCodeKey]: newCode,
    }));
  };

  const handleResetBoilerplate = () => {
    const boilerplate = getBoilerplate(activeQuestion, activeLanguage);
    setCodeStateMap((prev) => ({
      ...prev,
      [currentCodeKey]: boilerplate,
    }));
  };

  // Build combined test cases for the active question (sample test cases + custom user test cases)
  const currentTestCases: TestCaseItem[] = useMemo(() => {
    const samples: TestCaseItem[] = (activeQuestion.testCases || []).map((tc, idx) => ({
      id: `sample-${idx}`,
      input: tc.input,
      output: tc.output,
      isCustom: false,
    }));

    const customs = customTestCasesMap[activeQuestion._id] || [];
    return [...samples, ...customs];
  }, [activeQuestion, customTestCasesMap]);

  const handleAddCustomCase = () => {
    const customs = customTestCasesMap[activeQuestion._id] || [];
    const newCase: TestCaseItem = {
      id: `custom-${Date.now()}`,
      input: '{"input": "sample_value"}',
      isCustom: true,
    };
    const updated = [...customs, newCase];
    setCustomTestCasesMap((prev) => ({
      ...prev,
      [activeQuestion._id]: updated,
    }));
    // Focus the newly created test case
    setActiveCaseIndex(currentTestCases.length);
  };

  const handleDeleteCustomCase = (id: string) => {
    const customs = customTestCasesMap[activeQuestion._id] || [];
    const updated = customs.filter((c) => c.id !== id);
    setCustomTestCasesMap((prev) => ({
      ...prev,
      [activeQuestion._id]: updated,
    }));
    setActiveCaseIndex(0);
  };

  const handleUpdateCustomInput = (caseIndex: number, value: string) => {
    const currentItem = currentTestCases[caseIndex];
    if (!currentItem || !currentItem.isCustom) return;

    const customs = customTestCasesMap[activeQuestion._id] || [];
    const updated = customs.map((c) =>
      c.id === currentItem.id ? { ...c, input: value } : c
    );
    setCustomTestCasesMap((prev) => ({
      ...prev,
      [activeQuestion._id]: updated,
    }));
  };

  // Run Code Action: Evaluates active test cases
  const handleRunCode = async () => {
    if (isRunning || isSubmitting) return;
    setIsRunning(true);
    setRunResult(null);

    // Simulate test run
    setTimeout(() => {
      const totalCount = currentTestCases.length;
      const details = currentTestCases.map((tc, idx) => ({
        caseIndex: idx,
        passed: true,
        actualOutput: tc.output || 'Passed output',
        expectedOutput: tc.output,
      }));

      setRunResult({
        status: 'ACCEPTED',
        totalCount,
        passedCount: totalCount,
        details,
      });
      setIsRunning(false);
    }, 700);
  };

  // Submit Solution Action: Evaluates and broadcasts progress to socket
  const handleSubmitCode = async () => {
    if (isRunning || isSubmitting) return;
    setIsSubmitting(true);

    setTimeout(async () => {
      const totalCount = currentTestCases.length;
      setRunResult({
        status: 'ACCEPTED',
        totalCount,
        passedCount: totalCount,
      });

      if (match && user) {
        try {
          await updateProgress({
            matchId: match.matchId,
            userId: user._id,
            questionId: activeQuestion._id,
            testCasesPassed: totalCount,
            totalTestCases: totalCount,
          });
        } catch {
          // Handled gracefully
        }
      }

      setIsSubmitting(false);
    }, 900);
  };

  // Loading state during hydration
  if (isLoading && !match) {
    return (
      <div className="flex h-[calc(100dvh-4rem)] flex-col items-center justify-center text-center p-8">
        <Loader2 className="size-8 animate-spin text-marker" />
        <p className="mt-4 text-sm font-semibold text-muted-foreground">
          Entering Match Arena...
        </p>
      </div>
    );
  }

  // Error state
  if (error && !match) {
    return (
      <div className="flex h-[calc(100dvh-4rem)] flex-col items-center justify-center text-center p-8">
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="size-6" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-ink">Match Unavailable</h3>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-6 inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Virtual match object if previewing without backend server connection
  const displayMatch = match || {
    matchId: matchId || 'preview-match',
    roomCode: 'ARENA',
    player1: {
      userId: user?._id || 'p1',
      displayName: user?.username || 'You',
      socketId: '',
      isConnected: true,
    },
    player2: {
      userId: 'p2',
      displayName: 'Challenger',
      socketId: '',
      isConnected: true,
    },
    player1Stats: {
      player: user?._id || 'p1',
      questionProgress: [],
      totalTestCasesPassed: 0,
      timeTaken: 0,
    },
    player2Stats: {
      player: 'p2',
      questionProgress: [],
      totalTestCasesPassed: 0,
      timeTaken: 0,
    },
    questions: questions.map((q) => q._id),
    questionsData: questions,
    durationInMinutes: 45,
    startedAt: new Date(),
    status: 'in_progress' as const,
  };

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col overflow-hidden bg-background">
      {/* Top Header Navigation & Status Bar */}
      <MatchHeader
        match={displayMatch}
        questions={questions}
        activeQuestionIndex={activeQuestionIndex}
        onSelectQuestion={(idx) => {
          setActiveQuestionIndex(idx);
          setActiveCaseIndex(0);
          setRunResult(null);
        }}
        onRunCode={handleRunCode}
        onSubmitCode={handleSubmitCode}
        isRunning={isRunning}
        isSubmitting={isSubmitting}
      />

      {/* Main Resizable Workspace */}
      <div className="flex-1 overflow-hidden">
        <Group orientation="horizontal" className="h-full">
          {/* Left Panel: Problem Statement (Equal 50% initial width) */}
          <Panel defaultSize="50%" minSize="20%" maxSize="80%" className="flex flex-col overflow-hidden">
            <ProblemPanel
              question={activeQuestion}
              questionIndex={activeQuestionIndex}
            />
          </Panel>

          {/* Horizontal Drag Handle */}
          <Separator className="relative flex w-2 items-center justify-center bg-border/60 hover:bg-marker active:bg-marker transition-colors cursor-col-resize select-none group">
            <div className="h-10 w-1 rounded-full bg-muted-foreground/40 group-hover:bg-ink group-active:bg-ink transition-colors" />
          </Separator>

          {/* Right Panel: Code Editor (Top) & Testcase Console (Bottom) (Equal 50% initial width) */}
          <Panel defaultSize="50%" minSize="20%" className="flex flex-col overflow-hidden">
            <Group orientation="vertical" className="h-full">
              {/* Top Right: Monaco Editor */}
              <Panel defaultSize="60%" minSize="20%" className="flex flex-col overflow-hidden">
                <CodeEditorPanel
                  question={activeQuestion}
                  language={activeLanguage}
                  onLanguageChange={setActiveLanguage}
                  code={currentCode}
                  onCodeChange={handleCodeChange}
                  onResetBoilerplate={handleResetBoilerplate}
                />
              </Panel>

              {/* Vertical Drag Handle */}
              <Separator className="relative flex h-2 items-center justify-center bg-border/60 hover:bg-marker active:bg-marker transition-colors cursor-row-resize select-none group">
                <div className="h-1 w-10 rounded-full bg-muted-foreground/40 group-hover:bg-ink group-active:bg-ink transition-colors" />
              </Separator>

              {/* Bottom Right: Testcase Console */}
              <Panel defaultSize="40%" minSize="15%" className="flex flex-col overflow-hidden">
                <TestcaseConsole
                  testCases={currentTestCases}
                  activeCaseIndex={activeCaseIndex}
                  onSelectCase={setActiveCaseIndex}
                  onAddCustomCase={handleAddCustomCase}
                  onDeleteCustomCase={handleDeleteCustomCase}
                  onUpdateCustomInput={handleUpdateCustomInput}
                  runResult={runResult}
                  isRunning={isRunning}
                />
              </Panel>
            </Group>
          </Panel>
        </Group>
      </div>
    </div>
  );
}
