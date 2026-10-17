export interface ParameterDef {
  name: string;
  cppType: string;
  javaType: string;
  pythonType: string;
}

export interface ReturnTypeDef {
  cpp: string;
  java: string;
  python: string;
}

export interface QuestionSignature {
  methodName: string;
  params: ParameterDef[];
  returnType: ReturnTypeDef;
}

export const QUESTION_SIGNATURES: Record<string, QuestionSignature> = {
  "find-the-highest-altitude": {
    "methodName": "largestAltitude",
    "params": [
      {
        "name": "gain",
        "cppType": "vector<int>",
        "javaType": "int[]",
        "pythonType": "list[int]"
      }
    ],
    "returnType": {
      "cpp": "int",
      "java": "int",
      "python": "int"
    }
  },
  "check-if-array-is-sorted-and-rotated": {
    "methodName": "check",
    "params": [
      {
        "name": "nums",
        "cppType": "vector<int>",
        "javaType": "int[]",
        "pythonType": "list[int]"
      }
    ],
    "returnType": {
      "cpp": "bool",
      "java": "boolean",
      "python": "bool"
    }
  },
  "find-the-width-of-columns-in-a-grid": {
    "methodName": "findColumnWidth",
    "params": [
      {
        "name": "grid",
        "cppType": "vector<vector<int>>",
        "javaType": "int[][]",
        "pythonType": "list[list[int]]"
      }
    ],
    "returnType": {
      "cpp": "vector<int>",
      "java": "int[]",
      "python": "list[int]"
    }
  },
  "product-of-array-except-self": {
    "methodName": "productExceptSelf",
    "params": [
      {
        "name": "nums",
        "cppType": "vector<int>",
        "javaType": "int[]",
        "pythonType": "list[int]"
      }
    ],
    "returnType": {
      "cpp": "vector<int>",
      "java": "int[]",
      "python": "list[int]"
    }
  },
  "subarray-sum-equals-k": {
    "methodName": "subarraySum",
    "params": [
      {
        "name": "nums",
        "cppType": "vector<int>",
        "javaType": "int[]",
        "pythonType": "list[int]"
      },
      {
        "name": "k",
        "cppType": "int",
        "javaType": "int",
        "pythonType": "int"
      }
    ],
    "returnType": {
      "cpp": "int",
      "java": "int",
      "python": "int"
    }
  },
  "container-with-most-water": {
    "methodName": "maxArea",
    "params": [
      {
        "name": "height",
        "cppType": "vector<int>",
        "javaType": "int[]",
        "pythonType": "list[int]"
      }
    ],
    "returnType": {
      "cpp": "int",
      "java": "int",
      "python": "int"
    }
  },
  "minimum-size-subarray-sum": {
    "methodName": "minSubArrayLen",
    "params": [
      {
        "name": "target",
        "cppType": "int",
        "javaType": "int",
        "pythonType": "int"
      },
      {
        "name": "nums",
        "cppType": "vector<int>",
        "javaType": "int[]",
        "pythonType": "list[int]"
      }
    ],
    "returnType": {
      "cpp": "int",
      "java": "int",
      "python": "int"
    }
  },
  "first-missing-positive": {
    "methodName": "firstMissingPositive",
    "params": [
      {
        "name": "nums",
        "cppType": "vector<int>",
        "javaType": "int[]",
        "pythonType": "list[int]"
      }
    ],
    "returnType": {
      "cpp": "int",
      "java": "int",
      "python": "int"
    }
  },
  "sliding-window-maximum": {
    "methodName": "maxSlidingWindow",
    "params": [
      {
        "name": "nums",
        "cppType": "vector<int>",
        "javaType": "int[]",
        "pythonType": "list[int]"
      },
      {
        "name": "k",
        "cppType": "int",
        "javaType": "int",
        "pythonType": "int"
      }
    ],
    "returnType": {
      "cpp": "vector<int>",
      "java": "int[]",
      "python": "list[int]"
    }
  },
  "merge-strings-alternately": {
    "methodName": "mergeAlternately",
    "params": [
      {
        "name": "word1",
        "cppType": "string",
        "javaType": "String",
        "pythonType": "str"
      },
      {
        "name": "word2",
        "cppType": "string",
        "javaType": "String",
        "pythonType": "str"
      }
    ],
    "returnType": {
      "cpp": "string",
      "java": "String",
      "python": "str"
    }
  },
  "check-if-two-string-arrays-are-equivalent": {
    "methodName": "arrayStringsAreEqual",
    "params": [
      {
        "name": "word1",
        "cppType": "vector<string>",
        "javaType": "String[]",
        "pythonType": "list[str]"
      },
      {
        "name": "word2",
        "cppType": "vector<string>",
        "javaType": "String[]",
        "pythonType": "list[str]"
      }
    ],
    "returnType": {
      "cpp": "bool",
      "java": "boolean",
      "python": "bool"
    }
  },
  "longest-common-prefix": {
    "methodName": "longestCommonPrefix",
    "params": [
      {
        "name": "strs",
        "cppType": "vector<string>",
        "javaType": "String[]",
        "pythonType": "list[str]"
      }
    ],
    "returnType": {
      "cpp": "string",
      "java": "String",
      "python": "str"
    }
  },
  "longest-substring-without-repeating-characters": {
    "methodName": "lengthOfLongestSubstring",
    "params": [
      {
        "name": "s",
        "cppType": "string",
        "javaType": "String",
        "pythonType": "str"
      }
    ],
    "returnType": {
      "cpp": "int",
      "java": "int",
      "python": "int"
    }
  },
  "group-anagrams": {
    "methodName": "groupAnagrams",
    "params": [
      {
        "name": "strs",
        "cppType": "vector<string>",
        "javaType": "String[]",
        "pythonType": "list[str]"
      }
    ],
    "returnType": {
      "cpp": "vector<vector<string>>",
      "java": "List<List<String>>",
      "python": "list[list[str]]"
    }
  },
  "string-to-integer-atoi": {
    "methodName": "myAtoi",
    "params": [
      {
        "name": "s",
        "cppType": "string",
        "javaType": "String",
        "pythonType": "str"
      }
    ],
    "returnType": {
      "cpp": "int",
      "java": "int",
      "python": "int"
    }
  },
  "decode-string": {
    "methodName": "decodeString",
    "params": [
      {
        "name": "s",
        "cppType": "string",
        "javaType": "String",
        "pythonType": "str"
      }
    ],
    "returnType": {
      "cpp": "string",
      "java": "String",
      "python": "str"
    }
  },
  "minimum-window-substring": {
    "methodName": "minWindow",
    "params": [
      {
        "name": "s",
        "cppType": "string",
        "javaType": "String",
        "pythonType": "str"
      },
      {
        "name": "t",
        "cppType": "string",
        "javaType": "String",
        "pythonType": "str"
      }
    ],
    "returnType": {
      "cpp": "string",
      "java": "String",
      "python": "str"
    }
  },
  "shortest-palindrome": {
    "methodName": "shortestPalindrome",
    "params": [
      {
        "name": "s",
        "cppType": "string",
        "javaType": "String",
        "pythonType": "str"
      }
    ],
    "returnType": {
      "cpp": "string",
      "java": "String",
      "python": "str"
    }
  },
  "find-the-unique-winner": {
    "methodName": "findTheWinner",
    "params": [
      {
        "name": "votes",
        "cppType": "vector<string>",
        "javaType": "String[]",
        "pythonType": "list[str]"
      }
    ],
    "returnType": {
      "cpp": "string",
      "java": "String",
      "python": "str"
    }
  },
  "k-difference-pairs-existence": {
    "methodName": "findPairs",
    "params": [
      {
        "name": "nums",
        "cppType": "vector<int>",
        "javaType": "int[]",
        "pythonType": "list[int]"
      },
      {
        "name": "k",
        "cppType": "int",
        "javaType": "int",
        "pythonType": "int"
      }
    ],
    "returnType": {
      "cpp": "bool",
      "java": "boolean",
      "python": "bool"
    }
  },
  "most-frequent-digit-sum": {
    "methodName": "mostFrequentDigitSum",
    "params": [
      {
        "name": "nums",
        "cppType": "vector<int>",
        "javaType": "int[]",
        "pythonType": "list[int]"
      }
    ],
    "returnType": {
      "cpp": "int",
      "java": "int",
      "python": "int"
    }
  },
  "subarrays-with-equal-odd-and-even-count": {
    "methodName": "findMaxLength",
    "params": [
      {
        "name": "nums",
        "cppType": "vector<int>",
        "javaType": "int[]",
        "pythonType": "list[int]"
      }
    ],
    "returnType": {
      "cpp": "int",
      "java": "int",
      "python": "int"
    }
  },
  "group-anagrammatic-shifts": {
    "methodName": "groupStrings",
    "params": [
      {
        "name": "strs",
        "cppType": "vector<string>",
        "javaType": "String[]",
        "pythonType": "list[str]"
      }
    ],
    "returnType": {
      "cpp": "vector<vector<string>>",
      "java": "List<List<String>>",
      "python": "list[list[str]]"
    }
  },
  "longest-subarray-with-equal-frequency": {
    "methodName": "longestSubarray",
    "params": [
      {
        "name": "nums",
        "cppType": "vector<int>",
        "javaType": "int[]",
        "pythonType": "list[int]"
      }
    ],
    "returnType": {
      "cpp": "int",
      "java": "int",
      "python": "int"
    }
  },
  "find-period-of-fraction": {
    "methodName": "fractionToDecimal",
    "params": [
      {
        "name": "numerator",
        "cppType": "int",
        "javaType": "int",
        "pythonType": "int"
      },
      {
        "name": "denominator",
        "cppType": "int",
        "javaType": "int",
        "pythonType": "int"
      }
    ],
    "returnType": {
      "cpp": "int",
      "java": "int",
      "python": "int"
    }
  },
  "max-points-on-a-2d-plane-with-same-slope": {
    "methodName": "maxPoints",
    "params": [
      {
        "name": "points",
        "cppType": "vector<vector<int>>",
        "javaType": "int[][]",
        "pythonType": "list[list[int]]"
      }
    ],
    "returnType": {
      "cpp": "int",
      "java": "int",
      "python": "int"
    }
  },
  "minimum-window-substring-with-word-frequencies": {
    "methodName": "findSubstring",
    "params": [
      {
        "name": "s",
        "cppType": "string",
        "javaType": "String",
        "pythonType": "str"
      },
      {
        "name": "words",
        "cppType": "vector<string>",
        "javaType": "String[]",
        "pythonType": "list[str]"
      }
    ],
    "returnType": {
      "cpp": "int",
      "java": "int",
      "python": "int"
    }
  },
  "backspace-string-compare": {
    "methodName": "backspaceCompare",
    "params": [
      {
        "name": "s",
        "cppType": "string",
        "javaType": "String",
        "pythonType": "str"
      },
      {
        "name": "t",
        "cppType": "string",
        "javaType": "String",
        "pythonType": "str"
      }
    ],
    "returnType": {
      "cpp": "bool",
      "java": "boolean",
      "python": "bool"
    }
  },
  "baseball-game": {
    "methodName": "calPoints",
    "params": [
      {
        "name": "operations",
        "cppType": "vector<string>",
        "javaType": "String[]",
        "pythonType": "list[str]"
      }
    ],
    "returnType": {
      "cpp": "int",
      "java": "int",
      "python": "int"
    }
  },
  "make-the-string-great": {
    "methodName": "makeGood",
    "params": [
      {
        "name": "s",
        "cppType": "string",
        "javaType": "String",
        "pythonType": "str"
      }
    ],
    "returnType": {
      "cpp": "string",
      "java": "String",
      "python": "str"
    }
  },
  "daily-temperatures": {
    "methodName": "dailyTemperatures",
    "params": [
      {
        "name": "temperatures",
        "cppType": "vector<int>",
        "javaType": "int[]",
        "pythonType": "list[int]"
      }
    ],
    "returnType": {
      "cpp": "vector<int>",
      "java": "int[]",
      "python": "list[int]"
    }
  },
  "simplify-path": {
    "methodName": "simplifyPath",
    "params": [
      {
        "name": "path",
        "cppType": "string",
        "javaType": "String",
        "pythonType": "str"
      }
    ],
    "returnType": {
      "cpp": "string",
      "java": "String",
      "python": "str"
    }
  },
  "evaluate-reverse-polish-notation": {
    "methodName": "evalRPN",
    "params": [
      {
        "name": "tokens",
        "cppType": "vector<string>",
        "javaType": "String[]",
        "pythonType": "list[str]"
      }
    ],
    "returnType": {
      "cpp": "int",
      "java": "int",
      "python": "int"
    }
  },
  "online-stock-span": {
    "methodName": "next",
    "params": [
      {
        "name": "commands",
        "cppType": "vector<string>",
        "javaType": "String[]",
        "pythonType": "list[str]"
      },
      {
        "name": "arguments",
        "cppType": "vector<vector<int>>",
        "javaType": "int[][]",
        "pythonType": "list[list[int]]"
      }
    ],
    "returnType": {
      "cpp": "vector<int>",
      "java": "int[]",
      "python": "list[int]"
    }
  },
  "largest-rectangle-in-histogram": {
    "methodName": "largestRectangleArea",
    "params": [
      {
        "name": "heights",
        "cppType": "vector<int>",
        "javaType": "int[]",
        "pythonType": "list[int]"
      }
    ],
    "returnType": {
      "cpp": "int",
      "java": "int",
      "python": "int"
    }
  },
  "maximum-units-on-a-truck": {
    "methodName": "maximumUnits",
    "params": [
      {
        "name": "boxTypes",
        "cppType": "vector<vector<int>>",
        "javaType": "int[][]",
        "pythonType": "list[list[int]]"
      },
      {
        "name": "truckSize",
        "cppType": "int",
        "javaType": "int",
        "pythonType": "int"
      }
    ],
    "returnType": {
      "cpp": "int",
      "java": "int",
      "python": "int"
    }
  },
  "minimum-sum-of-four-digit-number-after-splitting-digits": {
    "methodName": "minimumSum",
    "params": [
      {
        "name": "num",
        "cppType": "int",
        "javaType": "int",
        "pythonType": "int"
      }
    ],
    "returnType": {
      "cpp": "int",
      "java": "int",
      "python": "int"
    }
  },
  "assign-cookies": {
    "methodName": "findContentChildren",
    "params": [
      {
        "name": "g",
        "cppType": "vector<int>",
        "javaType": "int[]",
        "pythonType": "list[int]"
      },
      {
        "name": "s",
        "cppType": "vector<int>",
        "javaType": "int[]",
        "pythonType": "list[int]"
      }
    ],
    "returnType": {
      "cpp": "int",
      "java": "int",
      "python": "int"
    }
  },
  "gas-station": {
    "methodName": "canCompleteCircuit",
    "params": [
      {
        "name": "gas",
        "cppType": "vector<int>",
        "javaType": "int[]",
        "pythonType": "list[int]"
      },
      {
        "name": "cost",
        "cppType": "vector<int>",
        "javaType": "int[]",
        "pythonType": "list[int]"
      }
    ],
    "returnType": {
      "cpp": "int",
      "java": "int",
      "python": "int"
    }
  },
  "non-overlapping-intervals": {
    "methodName": "eraseOverlapIntervals",
    "params": [
      {
        "name": "intervals",
        "cppType": "vector<vector<int>>",
        "javaType": "int[][]",
        "pythonType": "list[list[int]]"
      }
    ],
    "returnType": {
      "cpp": "int",
      "java": "int",
      "python": "int"
    }
  },
  "queue-reconstruction-by-height": {
    "methodName": "reconstructQueue",
    "params": [
      {
        "name": "people",
        "cppType": "vector<vector<int>>",
        "javaType": "int[][]",
        "pythonType": "list[list[int]]"
      }
    ],
    "returnType": {
      "cpp": "vector<vector<int>>",
      "java": "int[][]",
      "python": "list[list[int]]"
    }
  },
  "task-scheduler": {
    "methodName": "leastInterval",
    "params": [
      {
        "name": "tasks",
        "cppType": "vector<string>",
        "javaType": "String[]",
        "pythonType": "list[str]"
      },
      {
        "name": "n",
        "cppType": "int",
        "javaType": "int",
        "pythonType": "int"
      }
    ],
    "returnType": {
      "cpp": "int",
      "java": "int",
      "python": "int"
    }
  },
  "candy": {
    "methodName": "candy",
    "params": [
      {
        "name": "ratings",
        "cppType": "vector<int>",
        "javaType": "int[]",
        "pythonType": "list[int]"
      }
    ],
    "returnType": {
      "cpp": "int",
      "java": "int",
      "python": "int"
    }
  },
  "course-schedule-iii": {
    "methodName": "scheduleCourse",
    "params": [
      {
        "name": "courses",
        "cppType": "vector<vector<int>>",
        "javaType": "int[][]",
        "pythonType": "list[list[int]]"
      }
    ],
    "returnType": {
      "cpp": "int",
      "java": "int",
      "python": "int"
    }
  },
  "first-occurrence-in-sorted-array": {
    "methodName": "searchRange",
    "params": [
      {
        "name": "nums",
        "cppType": "vector<int>",
        "javaType": "int[]",
        "pythonType": "list[int]"
      },
      {
        "name": "target",
        "cppType": "int",
        "javaType": "int",
        "pythonType": "int"
      }
    ],
    "returnType": {
      "cpp": "int",
      "java": "int",
      "python": "int"
    }
  },
  "sqrtx": {
    "methodName": "mySqrt",
    "params": [
      {
        "name": "x",
        "cppType": "int",
        "javaType": "int",
        "pythonType": "int"
      }
    ],
    "returnType": {
      "cpp": "int",
      "java": "int",
      "python": "int"
    }
  },
  "search-insert-position": {
    "methodName": "searchInsert",
    "params": [
      {
        "name": "nums",
        "cppType": "vector<int>",
        "javaType": "int[]",
        "pythonType": "list[int]"
      },
      {
        "name": "target",
        "cppType": "int",
        "javaType": "int",
        "pythonType": "int"
      }
    ],
    "returnType": {
      "cpp": "int",
      "java": "int",
      "python": "int"
    }
  },
  "find-peak-element": {
    "methodName": "findPeakElement",
    "params": [
      {
        "name": "nums",
        "cppType": "vector<int>",
        "javaType": "int[]",
        "pythonType": "list[int]"
      }
    ],
    "returnType": {
      "cpp": "int",
      "java": "int",
      "python": "int"
    }
  },
  "koko-eating-bananas": {
    "methodName": "minEatingSpeed",
    "params": [
      {
        "name": "piles",
        "cppType": "vector<int>",
        "javaType": "int[]",
        "pythonType": "list[int]"
      },
      {
        "name": "h",
        "cppType": "int",
        "javaType": "int",
        "pythonType": "int"
      }
    ],
    "returnType": {
      "cpp": "int",
      "java": "int",
      "python": "int"
    }
  },
  "search-in-rotated-sorted-array": {
    "methodName": "search",
    "params": [
      {
        "name": "nums",
        "cppType": "vector<int>",
        "javaType": "int[]",
        "pythonType": "list[int]"
      },
      {
        "name": "target",
        "cppType": "int",
        "javaType": "int",
        "pythonType": "int"
      }
    ],
    "returnType": {
      "cpp": "int",
      "java": "int",
      "python": "int"
    }
  },
  "capacity-to-ship-packages-within-d-days": {
    "methodName": "shipWithinDays",
    "params": [
      {
        "name": "weights",
        "cppType": "vector<int>",
        "javaType": "int[]",
        "pythonType": "list[int]"
      },
      {
        "name": "days",
        "cppType": "int",
        "javaType": "int",
        "pythonType": "int"
      }
    ],
    "returnType": {
      "cpp": "int",
      "java": "int",
      "python": "int"
    }
  },
  "median-of-two-sorted-arrays": {
    "methodName": "findMedianSortedArrays",
    "params": [
      {
        "name": "nums1",
        "cppType": "vector<int>",
        "javaType": "int[]",
        "pythonType": "list[int]"
      },
      {
        "name": "nums2",
        "cppType": "vector<int>",
        "javaType": "int[]",
        "pythonType": "list[int]"
      }
    ],
    "returnType": {
      "cpp": "double",
      "java": "double",
      "python": "float"
    }
  },
  "split-array-largest-sum": {
    "methodName": "splitArray",
    "params": [
      {
        "name": "nums",
        "cppType": "vector<int>",
        "javaType": "int[]",
        "pythonType": "list[int]"
      },
      {
        "name": "k",
        "cppType": "int",
        "javaType": "int",
        "pythonType": "int"
      }
    ],
    "returnType": {
      "cpp": "int",
      "java": "int",
      "python": "int"
    }
  },
  "min-cost-to-reach-top-with-variable-steps": {
    "methodName": "minCostClimbingStairs",
    "params": [
      {
        "name": "cost",
        "cppType": "vector<int>",
        "javaType": "int[]",
        "pythonType": "list[int]"
      }
    ],
    "returnType": {
      "cpp": "int",
      "java": "int",
      "python": "int"
    }
  },
  "max-energy-collector": {
    "methodName": "maximumEnergy",
    "params": [
      {
        "name": "energy",
        "cppType": "vector<int>",
        "javaType": "int[]",
        "pythonType": "list[int]"
      }
    ],
    "returnType": {
      "cpp": "int",
      "java": "int",
      "python": "int"
    }
  },
  "minimum-steps-to-one": {
    "methodName": "integerReplacement",
    "params": [
      {
        "name": "n",
        "cppType": "int",
        "javaType": "int",
        "pythonType": "int"
      }
    ],
    "returnType": {
      "cpp": "int",
      "java": "int",
      "python": "int"
    }
  },
  "max-profit-non-overlapping-tasks": {
    "methodName": "jobScheduling",
    "params": [
      {
        "name": "startTime",
        "cppType": "vector<int>",
        "javaType": "int[]",
        "pythonType": "list[int]"
      },
      {
        "name": "endTime",
        "cppType": "vector<int>",
        "javaType": "int[]",
        "pythonType": "list[int]"
      },
      {
        "name": "profit",
        "cppType": "vector<int>",
        "javaType": "int[]",
        "pythonType": "list[int]"
      }
    ],
    "returnType": {
      "cpp": "int",
      "java": "int",
      "python": "int"
    }
  },
  "grid-path-maximum-gold": {
    "methodName": "getMaximumGold",
    "params": [
      {
        "name": "grid",
        "cppType": "vector<vector<int>>",
        "javaType": "int[][]",
        "pythonType": "list[list[int]]"
      }
    ],
    "returnType": {
      "cpp": "int",
      "java": "int",
      "python": "int"
    }
  },
  "target-sum-subsets": {
    "methodName": "findTargetSumWays",
    "params": [
      {
        "name": "nums",
        "cppType": "vector<int>",
        "javaType": "int[]",
        "pythonType": "list[int]"
      },
      {
        "name": "target",
        "cppType": "int",
        "javaType": "int",
        "pythonType": "int"
      }
    ],
    "returnType": {
      "cpp": "int",
      "java": "int",
      "python": "int"
    }
  },
  "bounded-difference-lis": {
    "methodName": "longestSubsequence",
    "params": [
      {
        "name": "nums",
        "cppType": "vector<int>",
        "javaType": "int[]",
        "pythonType": "list[int]"
      },
      {
        "name": "k",
        "cppType": "int",
        "javaType": "int",
        "pythonType": "int"
      }
    ],
    "returnType": {
      "cpp": "int",
      "java": "int",
      "python": "int"
    }
  },
  "minimum-cost-to-merge-stones-dp": {
    "methodName": "mergeStones",
    "params": [
      {
        "name": "stones",
        "cppType": "vector<int>",
        "javaType": "int[]",
        "pythonType": "list[int]"
      },
      {
        "name": "k",
        "cppType": "int",
        "javaType": "int",
        "pythonType": "int"
      }
    ],
    "returnType": {
      "cpp": "int",
      "java": "int",
      "python": "int"
    }
  },
  "divisible-digit-sums": {
    "methodName": "count",
    "params": [
      {
        "name": "low",
        "cppType": "int",
        "javaType": "int",
        "pythonType": "int"
      },
      {
        "name": "high",
        "cppType": "int",
        "javaType": "int",
        "pythonType": "int"
      },
      {
        "name": "k",
        "cppType": "int",
        "javaType": "int",
        "pythonType": "int"
      }
    ],
    "returnType": {
      "cpp": "int",
      "java": "int",
      "python": "int"
    }
  }
};
