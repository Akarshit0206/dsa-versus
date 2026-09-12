import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { RotateCcw, Code2, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PublicQuestion } from '@/types';

export type SupportedLanguage = 'python' | 'cpp' | 'java';

export interface LanguageOption {
  id: SupportedLanguage;
  judge0Id: number;
  label: string;
  monacoLang: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { id: 'python', judge0Id: 71, label: 'Python 3', monacoLang: 'python' },
  { id: 'cpp', judge0Id: 54, label: 'C++ (GCC)', monacoLang: 'cpp' },
  { id: 'java', judge0Id: 62, label: 'Java (OpenJDK)', monacoLang: 'java' },
];

export const DEFAULT_BOILERPLATES: Record<SupportedLanguage, string> = {
  python: `import sys

def solve():
    # Write your solution here
    pass

if __name__ == "__main__":
    solve()
`,
  cpp: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    // Write your solution here
    
    return 0;
}
`,
  java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        // Write your solution here
        
    }
}
`,
};

interface CodeEditorPanelProps {
  question?: PublicQuestion;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  code: string;
  onCodeChange: (newCode: string) => void;
  onResetBoilerplate: () => void;
}

export function CodeEditorPanel({
  question,
  language,
  onLanguageChange,
  code,
  onCodeChange,
  onResetBoilerplate,
}: CodeEditorPanelProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const activeLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.id === language) || SUPPORTED_LANGUAGES[0];

  const handleConfirmReset = () => {
    onResetBoilerplate();
    setShowResetConfirm(false);
  };

  return (
    <div className="flex h-full flex-col bg-[#1e1e1e] text-slate-200">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between border-b border-border/40 bg-[#252526] px-4 py-2 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
            <Code2 className="size-3.5 text-marker" />
            <span>Language:</span>
          </div>

          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
            className="rounded-md border border-border/70 bg-[#1e1e1e] px-2.5 py-1 font-semibold text-slate-200 outline-none hover:border-marker/50 focus:border-marker transition-colors"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Right side tools */}
        <div className="flex items-center gap-2">
          {showResetConfirm ? (
            <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-400 animate-in fade-in">
              <AlertCircle className="size-3" />
              <span>Reset code?</span>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="font-bold text-amber-300 underline hover:text-white ml-1"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="text-muted-foreground hover:text-white ml-1"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-[#333333] hover:text-slate-200 transition-colors"
              title="Reset to default starter code"
            >
              <RotateCcw className="size-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div className="relative flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={activeLangObj.monacoLang}
          value={code}
          onChange={(value) => onCodeChange(value || '')}
          theme="vs-dark"
          options={{
            fontSize: 13,
            lineNumbers: 'on',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            padding: { top: 12, bottom: 12 },
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            suggestOnTriggerCharacters: true,
            wordWrap: 'on',
          }}
          loading={
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              Loading code editor...
            </div>
          }
        />
      </div>
    </div>
  );
}
