import type { PublicQuestion } from '@/types';

export interface TestCaseParam {
  name: string;
  value: string;
}

/**
 * Known parameter names for standard problems if array input is encountered.
 */
const KNOWN_PROBLEM_PARAMS: Record<string, string[]> = {
  'Merge Strings Alternately': ['word1', 'word2'],
  'Check If Two String Arrays are Equivalent': ['word1', 'word2'],
  'Longest Common Prefix': ['strs'],
  'Longest Substring Without Repeating Characters': ['s'],
  'Group Anagrams': ['strs'],
  'String to Integer (atoi)': ['s'],
  'Decode String': ['s'],
  'Minimum Window Substring': ['s', 't'],
  'Shortest Palindrome': ['s'],
  'Find the Unique Winner': ['votes'],
  'K-Difference Pairs Existence': ['nums', 'k'],
  'Most Frequent Digit Sum': ['nums'],
  'Subarrays with Equal Odd and Even Count': ['nums'],
  'Group Anagrammatic Shifts': ['strs'],
  'Longest Subarray with Equal Frequency': ['nums'],
  'Find Period of Fraction': ['numerator', 'denominator'],
  'Max Points on a 2D Plane with Same Slope': ['points'],
  'Minimum Window Substring with Word Frequencies': ['s', 'words'],
  'Maximum Units on a Truck': ['boxTypes', 'truckSize'],
  'Minimum Sum of Four Digit Number After Splitting Digits': ['num'],
  'Assign Cookies': ['g', 's'],
  'Gas Station': ['gas', 'cost'],
  'Non-overlapping Intervals': ['intervals'],
  'Queue Reconstruction by Height': ['people'],
  'Task Scheduler': ['tasks', 'n'],
  'Candy': ['ratings'],
  'Course Schedule III': ['courses'],
  'First Occurrence in Sorted Array': ['nums', 'target'],
  'Sqrt(x)': ['x'],
  'Search Insert Position': ['nums', 'target'],
  'Find Peak Element': ['nums'],
  'Koko Eating Bananas': ['piles', 'h'],
  'Search in Rotated Sorted Array': ['nums', 'target'],
  'Capacity To Ship Packages Within D Days': ['weights', 'days'],
  'Median of Two Sorted Arrays': ['nums1', 'nums2'],
  'Split Array Largest Sum': ['nums', 'k'],
};

/**
 * Extracts candidate parameter names from a question description
 */
function extractParamsFromDescription(description: string, count: number): string[] {
  if (!description) return [];

  // Match words inside backticks like `nums`, `target`, `k`
  const backtickMatches = Array.from(description.matchAll(/`([a-zA-Z_][a-zA-Z0-9_]*)`/g)).map(
    (m) => m[1]
  );

  const reserved = new Set([
    'true',
    'false',
    'null',
    'undefined',
    'i',
    'j',
    'ans',
    'return',
    'int',
    'string',
    'boolean',
    'length',
    'size',
    'array',
    'integer',
  ]);

  const candidates = Array.from(
    new Set(backtickMatches.filter((w) => !reserved.has(w.toLowerCase())))
  );

  if (candidates.length >= count) {
    return candidates.slice(0, count);
  }

  return [];
}

/**
 * Parses a raw test case input string into named parameters:
 * e.g. '{"target": 7, "nums": [2, 3, 1, 2, 4, 3]}'
 * -> [{ name: 'target', value: '7' }, { name: 'nums', value: '[2, 3, 1, 2, 4, 3]' }]
 */
export function parseTestCaseInput(
  rawInput: string,
  question?: PublicQuestion
): TestCaseParam[] {
  if (!rawInput || typeof rawInput !== 'string') {
    return [{ name: 'input', value: '' }];
  }

  const trimmed = rawInput.trim();

  // Try parsing as JSON
  try {
    const parsed = JSON.parse(trimmed);

    // 1. JSON Object format: { "nums": [2,7,11,15], "target": 9 }
    if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const keys = Object.keys(parsed);
      if (keys.length > 0) {
        return keys.map((key) => {
          const val = parsed[key];
          let formattedVal: string;
          if (typeof val === 'string') {
            formattedVal = JSON.stringify(val);
          } else if (typeof val === 'object' && val !== null) {
            formattedVal = JSON.stringify(val);
          } else {
            formattedVal = String(val);
          }
          return { name: key, value: formattedVal };
        });
      }
    }

    // 2. JSON Array format: [[1, 5, 3, 4, 2], 3]
    if (Array.isArray(parsed)) {
      let paramNames: string[] = [];

      if (question?.title && KNOWN_PROBLEM_PARAMS[question.title]) {
        paramNames = KNOWN_PROBLEM_PARAMS[question.title];
      }

      if (paramNames.length !== parsed.length && question?.description) {
        paramNames = extractParamsFromDescription(question.description, parsed.length);
      }

      return parsed.map((item, idx) => {
        const name = paramNames[idx] || (parsed.length === 1 ? 'nums' : `param${idx + 1}`);
        let formattedVal: string;
        if (typeof item === 'string') {
          formattedVal = JSON.stringify(item);
        } else if (typeof item === 'object' && item !== null) {
          formattedVal = JSON.stringify(item);
        } else {
          formattedVal = String(item);
        }
        return { name, value: formattedVal };
      });
    }

    // 3. Primitive JSON value (e.g. string "abc" or number 42)
    return [{ name: 'input', value: JSON.stringify(parsed) }];
  } catch {
    // Check if input was already formatted line-by-line like "nums = [2,7]\ntarget = 9"
    const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);
    const parsedLines: TestCaseParam[] = [];
    const lineRegex = /^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.*)$/;

    for (const line of lines) {
      const match = line.match(lineRegex);
      if (match) {
        parsedLines.push({ name: match[1], value: match[2].trim() });
      }
    }

    if (parsedLines.length > 0) {
      return parsedLines;
    }

    return [{ name: 'input', value: trimmed }];
  }
}

/**
 * Serializes a list of parameters back into a JSON object string:
 * [{ name: 'target', value: '7' }, { name: 'nums', value: '[2, 3]' }]
 * -> '{"target": 7, "nums": [2, 3]}'
 */
export function serializeTestCaseInput(params: TestCaseParam[]): string {
  if (!params || params.length === 0) {
    return '{}';
  }

  // If there's only 1 param named 'input' and it's not valid JSON, return its raw value
  if (params.length === 1 && params[0].name === 'input') {
    return params[0].value;
  }

  const obj: Record<string, any> = {};

  for (const param of params) {
    const rawVal = param.value.trim();
    if (rawVal === '') {
      obj[param.name] = '';
      continue;
    }

    try {
      // Parse numbers, booleans, arrays, objects, and quoted strings
      obj[param.name] = JSON.parse(rawVal);
    } catch {
      // Fallback to literal string if user typed an unquoted string
      obj[param.name] = rawVal;
    }
  }

  return JSON.stringify(obj);
}

/**
 * Creates a clean default input string for a new custom test case,
 * cloning the structure and names of the question's parameters.
 */
export function createDefaultTestCaseInput(question?: PublicQuestion): string {
  if (question?.testCases && question.testCases.length > 0) {
    const sampleInput = question.testCases[0].input;
    const params = parseTestCaseInput(sampleInput, question);
    return serializeTestCaseInput(params);
  }

  return JSON.stringify({ input: '' });
}

/**
 * Formats raw input string cleanly for display in problem examples:
 * '{"target": 7, "nums": [2, 3, 1, 2, 4, 3]}' -> 'target = 7, nums = [2, 3, 1, 2, 4, 3]'
 */
export function formatExampleInput(rawInput: string, question?: PublicQuestion): string {
  const params = parseTestCaseInput(rawInput, question);
  if (params.length === 1 && params[0].name === 'input') {
    return params[0].value;
  }
  return params.map((p) => `${p.name} = ${p.value}`).join(', ');
}
