import {
  QUESTION_SIGNATURES,
  type QuestionSignature,
} from "./questionSignaturesData.js";

export class CodeDriverService {
  /**
   * Look up method signature by question slug or normalized title
   */
  public static getSignature(slugOrTitle?: string): QuestionSignature | undefined {
    if (!slugOrTitle) return undefined;

    const normalizedSlug = slugOrTitle.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    if (QUESTION_SIGNATURES[normalizedSlug]) {
      return QUESTION_SIGNATURES[normalizedSlug];
    }

    // Try finding by slug directly
    if (QUESTION_SIGNATURES[slugOrTitle]) {
      return QUESTION_SIGNATURES[slugOrTitle];
    }

    return undefined;
  }

  /**
   * Generates authentic LeetCode starter code for Python, C++, and Java
   */
  public static getStarterCode(slug: string): Record<string, string> {
    const sig = this.getSignature(slug);

    if (!sig) {
      return {
        python: `class Solution:\n    def solve(self):\n        pass\n`,
        cpp: `#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    void solve() {\n        \n    }\n};\n`,
        java: `import java.util.*;\n\nclass Solution {\n    public void solve() {\n        \n    }\n}\n`,
      };
    }

    const { methodName, params, returnType } = sig;

    // 1. Python Starter Code
    const pyParams = params.map((p) => `${p.name}: ${p.pythonType}`).join(", ");
    const pyCode = `class Solution:\n    def ${methodName}(self${pyParams ? ", " + pyParams : ""}) -> ${returnType.python}:\n        pass\n`;

    // 2. C++ Starter Code
    const cppParams = params
      .map((p) => {
        const isVectorOrString = p.cppType.includes("vector") || p.cppType === "string";
        const typeStr = isVectorOrString ? `${p.cppType}&` : p.cppType;
        return `${typeStr} ${p.name}`;
      })
      .join(", ");
    const cppCode = `#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    ${returnType.cpp} ${methodName}(${cppParams}) {\n        \n    }\n};\n`;

    // 3. Java Starter Code
    const javaParams = params.map((p) => `${p.javaType} ${p.name}`).join(", ");
    const javaCode = `import java.util.*;\n\nclass Solution {\n    public ${returnType.java} ${methodName}(${javaParams}) {\n        \n    }\n}\n`;

    return {
      python: pyCode,
      cpp: cppCode,
      java: javaCode,
      "71": pyCode,
      "54": cppCode,
      "62": javaCode,
    };
  }

  /**
   * Wraps user-submitted Solution class with invisible Driver Code to execute against JSON test cases
   */
  public static wrapCode(params: {
    sourceCode: string;
    languageId: number | string;
    slug?: string;
    title?: string;
  }): string {
    const { sourceCode, languageId, slug, title } = params;
    const lang = String(languageId).toLowerCase();

    // If user submitted code already containing a main entry point, execute as-is
    if (
      sourceCode.includes("int main(") ||
      sourceCode.includes("int main ()") ||
      sourceCode.includes("public static void main") ||
      sourceCode.includes("def main(") ||
      sourceCode.includes("if __name__ == '__main__':") ||
      sourceCode.includes('if __name__ == "__main__":')
    ) {
      return sourceCode;
    }

    const sig = this.getSignature(slug) || this.getSignature(title);

    // 1. PYTHON DRIVER (Language 71)
    if (lang === "71" || lang === "python" || lang === "py") {
      const methodName = sig ? sig.methodName : "";
      return `${sourceCode}\n
# --- DSA-VERSUS LEETCODE PYTHON DRIVER ---
import sys, json

def _dsa_driver():
    raw = sys.stdin.read().strip()
    if not raw:
        return
    try:
        data = json.loads(raw)
    except Exception:
        data = raw

    sol = Solution()
    method_name = "${methodName}"
    fn = getattr(sol, method_name, None)
    if not fn:
        methods = [m for m in dir(sol) if not m.startswith('_') and callable(getattr(sol, m))]
        fn = getattr(sol, methods[0]) if methods else None
    if not fn:
        return

    if isinstance(data, dict):
        ans = fn(**data)
    elif isinstance(data, list):
        ans = fn(*data)
    else:
        ans = fn(data)

    if isinstance(ans, bool):
        print(str(ans).lower())
    elif isinstance(ans, str):
        print(json.dumps(ans))
    elif isinstance(ans, (list, tuple, dict)):
        print(json.dumps(ans, separators=(', ', ': ')))
    elif ans is None:
        print("null")
    else:
        print(ans)

if __name__ == '__main__':
    _dsa_driver()
`;
    }

    // 2. C++ DRIVER (Language 54)
    if (lang === "54" || lang === "cpp" || lang === "c++") {
      return this.generateCppDriver(sourceCode, sig);
    }

    // 3. JAVA DRIVER (Language 62)
    if (lang === "62" || lang === "java") {
      return this.generateJavaDriver(sourceCode, sig);
    }

    return sourceCode;
  }

  /**
   * Generates C++ Driver with zero-dependency JSON token parsing
   */
  private static generateCppDriver(sourceCode: string, sig?: QuestionSignature): string {
    const methodName = sig ? sig.methodName : "solve";
    const params = sig ? sig.params : [];

    let paramParsing = "";
    const callArgs: string[] = [];

    params.forEach((p, idx) => {
      const varName = p.name || `param_${idx}`;
      callArgs.push(varName);

      if (p.cppType === "int") {
        paramParsing += `    int ${varName} = DsaDriver::parseInt(cin);\n`;
      } else if (p.cppType === "double") {
        paramParsing += `    double ${varName} = DsaDriver::parseDouble(cin);\n`;
      } else if (p.cppType === "bool") {
        paramParsing += `    bool ${varName} = DsaDriver::parseBool(cin);\n`;
      } else if (p.cppType === "string") {
        paramParsing += `    string ${varName} = DsaDriver::parseString(cin);\n`;
      } else if (p.cppType === "vector<int>") {
        paramParsing += `    vector<int> ${varName} = DsaDriver::parseVectorInt(cin);\n`;
      } else if (p.cppType === "vector<string>") {
        paramParsing += `    vector<string> ${varName} = DsaDriver::parseVectorString(cin);\n`;
      } else if (p.cppType === "vector<vector<int>>") {
        paramParsing += `    vector<vector<int>> ${varName} = DsaDriver::parseVectorVectorInt(cin);\n`;
      } else if (p.cppType === "vector<vector<string>>") {
        paramParsing += `    vector<vector<string>> ${varName} = DsaDriver::parseVectorVectorString(cin);\n`;
      } else {
        paramParsing += `    int ${varName} = DsaDriver::parseInt(cin);\n`;
      }
    });

    return `#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
#include <cctype>

using namespace std;

${sourceCode}

// --- DSA-VERSUS LEETCODE C++ DRIVER ---
namespace DsaDriver {
    inline void skipWsAndComma(istream& is) {
        while (is && (isspace(is.peek()) || is.peek() == ',')) is.get();
    }

    inline int parseInt(istream& is) {
        while (is && !isdigit(is.peek()) && is.peek() != '-') is.get();
        int x = 0;
        is >> x;
        return x;
    }

    inline double parseDouble(istream& is) {
        while (is && !isdigit(is.peek()) && is.peek() != '-') is.get();
        double x = 0;
        is >> x;
        return x;
    }

    inline bool parseBool(istream& is) {
        while (is && is.peek() != 't' && is.peek() != 'f') is.get();
        string s;
        while (is && isalpha(is.peek())) s += (char)is.get();
        return s == "true";
    }

    inline string parseString(istream& is) {
        while (is && is.peek() != '"') is.get();
        if (is) is.get();
        string s = "";
        while (is && is.peek() != '"') {
            if (is.peek() == '\\\\') is.get();
            s += (char)is.get();
        }
        if (is) is.get();
        return s;
    }

    inline vector<int> parseVectorInt(istream& is) {
        vector<int> res;
        while (is && is.peek() != '[') is.get();
        if (is) is.get();
        while (is) {
            skipWsAndComma(is);
            if (!is || is.peek() == ']') { if (is) is.get(); break; }
            res.push_back(parseInt(is));
        }
        return res;
    }

    inline vector<string> parseVectorString(istream& is) {
        vector<string> res;
        while (is && is.peek() != '[') is.get();
        if (is) is.get();
        while (is) {
            skipWsAndComma(is);
            if (!is || is.peek() == ']') { if (is) is.get(); break; }
            res.push_back(parseString(is));
        }
        return res;
    }

    inline vector<vector<int>> parseVectorVectorInt(istream& is) {
        vector<vector<int>> res;
        while (is && is.peek() != '[') is.get();
        if (is) is.get();
        while (is) {
            skipWsAndComma(is);
            if (!is || is.peek() == ']') { if (is) is.get(); break; }
            res.push_back(parseVectorInt(is));
        }
        return res;
    }

    inline vector<vector<string>> parseVectorVectorString(istream& is) {
        vector<vector<string>> res;
        while (is && is.peek() != '[') is.get();
        if (is) is.get();
        while (is) {
            skipWsAndComma(is);
            if (!is || is.peek() == ']') { if (is) is.get(); break; }
            res.push_back(parseVectorString(is));
        }
        return res;
    }

    inline void printVal(int x) { cout << x; }
    inline void printVal(double x) { cout << x; }
    inline void printVal(bool b) { cout << (b ? "true" : "false"); }
    inline void printVal(const string& s) { cout << "\\"" << s << "\\""; }

    template<typename T>
    inline void printVal(const vector<T>& v) {
        cout << "[";
        for (size_t i = 0; i < v.size(); i++) {
            printVal(v[i]);
            if (i + 1 < v.size()) cout << ", ";
        }
        cout << "]";
    }
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

${paramParsing}
    Solution sol;
    auto ans = sol.${methodName}(${callArgs.join(", ")});
    DsaDriver::printVal(ans);
    cout << "\\n";
    return 0;
}
`;
  }

  /**
   * Generates Java Driver
   */
  private static generateJavaDriver(sourceCode: string, sig?: QuestionSignature): string {
    const methodName = sig ? sig.methodName : "solve";
    const params = sig ? sig.params : [];

    let paramParsing = "";
    const callArgs: string[] = [];

    params.forEach((p, idx) => {
      const varName = p.name || `param_${idx}`;
      callArgs.push(varName);

      if (p.javaType === "int") {
        paramParsing += `        int ${varName} = DsaDriver.parseInt();\n`;
      } else if (p.javaType === "double") {
        paramParsing += `        double ${varName} = DsaDriver.parseDouble();\n`;
      } else if (p.javaType === "boolean") {
        paramParsing += `        boolean ${varName} = DsaDriver.parseBool();\n`;
      } else if (p.javaType === "String") {
        paramParsing += `        String ${varName} = DsaDriver.parseString();\n`;
      } else if (p.javaType === "int[]") {
        paramParsing += `        int[] ${varName} = DsaDriver.parseIntArray();\n`;
      } else if (p.javaType === "String[]") {
        paramParsing += `        String[] ${varName} = DsaDriver.parseStringArray();\n`;
      } else if (p.javaType === "int[][]") {
        paramParsing += `        int[][] ${varName} = DsaDriver.parseIntMatrix();\n`;
      } else {
        paramParsing += `        int ${varName} = DsaDriver.parseInt();\n`;
      }
    });

    return `import java.util.*;
import java.io.*;

${sourceCode}

public class Main {
    static class DsaDriver {
        static String content = "";
        static int pos = 0;

        static void init() {
            Scanner sc = new Scanner(System.in);
            StringBuilder sb = new StringBuilder();
            while (sc.hasNextLine()) {
                sb.append(sc.nextLine()).append("\\n");
            }
            content = sb.toString();
            pos = 0;
        }

        static int parseInt() {
            while (pos < content.length() && !Character.isDigit(content.charAt(pos)) && content.charAt(pos) != '-') {
                pos++;
            }
            if (pos >= content.length()) return 0;
            int start = pos++;
            while (pos < content.length() && Character.isDigit(content.charAt(pos))) {
                pos++;
            }
            return Integer.parseInt(content.substring(start, pos));
        }

        static double parseDouble() {
            while (pos < content.length() && !Character.isDigit(content.charAt(pos)) && content.charAt(pos) != '-') {
                pos++;
            }
            if (pos >= content.length()) return 0.0;
            int start = pos++;
            while (pos < content.length() && (Character.isDigit(content.charAt(pos)) || content.charAt(pos) == '.')) {
                pos++;
            }
            return Double.parseDouble(content.substring(start, pos));
        }

        static boolean parseBool() {
            while (pos < content.length() && content.charAt(pos) != 't' && content.charAt(pos) != 'f') {
                pos++;
            }
            if (pos >= content.length()) return false;
            boolean val = content.startsWith("true", pos);
            while (pos < content.length() && Character.isLetter(content.charAt(pos))) {
                pos++;
            }
            return val;
        }

        static String parseString() {
            while (pos < content.length() && content.charAt(pos) != '"') {
                pos++;
            }
            if (pos >= content.length()) return "";
            pos++;
            int start = pos;
            while (pos < content.length() && content.charAt(pos) != '"') {
                pos++;
            }
            String s = content.substring(start, pos);
            if (pos < content.length()) pos++;
            return s;
        }

        static int[] parseIntArray() {
            while (pos < content.length() && content.charAt(pos) != '[') {
                pos++;
            }
            if (pos >= content.length()) return new int[0];
            pos++;
            List<Integer> list = new ArrayList<>();
            while (pos < content.length()) {
                while (pos < content.length() && (Character.isWhitespace(content.charAt(pos)) || content.charAt(pos) == ',')) {
                    pos++;
                }
                if (pos >= content.length() || content.charAt(pos) == ']') {
                    if (pos < content.length()) pos++;
                    break;
                }
                list.add(parseInt());
            }
            int[] res = new int[list.size()];
            for (int i = 0; i < list.size(); i++) res[i] = list.get(i);
            return res;
        }

        static String[] parseStringArray() {
            while (pos < content.length() && content.charAt(pos) != '[') {
                pos++;
            }
            if (pos >= content.length()) return new String[0];
            pos++;
            List<String> list = new ArrayList<>();
            while (pos < content.length()) {
                while (pos < content.length() && (Character.isWhitespace(content.charAt(pos)) || content.charAt(pos) == ',')) {
                    pos++;
                }
                if (pos >= content.length() || content.charAt(pos) == ']') {
                    if (pos < content.length()) pos++;
                    break;
                }
                list.add(parseString());
            }
            return list.toArray(new String[0]);
        }

        static int[][] parseIntMatrix() {
            while (pos < content.length() && content.charAt(pos) != '[') {
                pos++;
            }
            if (pos >= content.length()) return new int[0][0];
            pos++;
            List<int[]> list = new ArrayList<>();
            while (pos < content.length()) {
                while (pos < content.length() && (Character.isWhitespace(content.charAt(pos)) || content.charAt(pos) == ',')) {
                    pos++;
                }
                if (pos >= content.length() || content.charAt(pos) == ']') {
                    if (pos < content.length()) pos++;
                    break;
                }
                list.add(parseIntArray());
            }
            return list.toArray(new int[0][]);
        }

        static void printResult(Object obj) {
            if (obj == null) {
                System.out.println("null");
            } else if (obj instanceof String) {
                System.out.println('"' + String.valueOf(obj) + '"');
            } else if (obj instanceof int[]) {
                System.out.println(Arrays.toString((int[]) obj));
            } else if (obj instanceof double[]) {
                System.out.println(Arrays.toString((double[]) obj));
            } else if (obj instanceof Object[]) {
                System.out.println(Arrays.deepToString((Object[]) obj));
            } else {
                System.out.println(obj);
            }
        }
    }

    public static void main(String[] args) {
        DsaDriver.init();
${paramParsing}
        Solution sol = new Solution();
        Object ans = sol.${methodName}(${callArgs.join(", ")});
        DsaDriver.printResult(ans);
    }
}
`;
  }

  /**
   * Helper to strip enclosing double or single quotes from a string
   */
  public static stripQuotes(str: string): string {
    const trimmed = str.trim();
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length >= 2) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'") && trimmed.length >= 2)
    ) {
      return trimmed.slice(1, -1);
    }
    return trimmed;
  }

  /**
   * Robust LeetCode output comparison (handling quote normalization, JSON array/object normalization, and boolean strings)
   */
  public static isEqualOutput(actualRaw?: string | null, expectedRaw?: string | null): boolean {
    if (!actualRaw && !expectedRaw) return true;

    const actual = (actualRaw ?? "").replace(/\r\n/g, "\n").trim();
    const expected = (expectedRaw ?? "").replace(/\r\n/g, "\n").trim();

    if (actual === expected) return true;

    // 1. Check if both match after stripping outer quotes (e.g. "C" vs C, 'C' vs "C", "" vs empty)
    if (this.stripQuotes(actual) === this.stripQuotes(expected)) {
      return true;
    }

    // 2. Try comparing booleans (case-insensitive, e.g. "True" vs "true")
    const aLower = actual.toLowerCase();
    const eLower = expected.toLowerCase();
    if ((aLower === "true" || aLower === "false") && (eLower === "true" || eLower === "false")) {
      return aLower === eLower;
    }

    // 3. Try JSON parsing for structural equality (e.g. [1, 2] vs [1,2], or JSON-encoded strings)
    try {
      const aJson = JSON.parse(actual);
      const eJson = JSON.parse(expected);
      if (JSON.stringify(aJson) === JSON.stringify(eJson)) {
        return true;
      }
      if (typeof aJson === "string" && typeof eJson === "string" && aJson === eJson) {
        return true;
      }
    } catch {}

    // 4. One might be JSON-encoded string (e.g. '"C"') and the other raw string ('C')
    try {
      const eJson = JSON.parse(expected);
      if (typeof eJson === "string" && (eJson === actual || eJson === this.stripQuotes(actual))) {
        return true;
      }
    } catch {}
    try {
      const aJson = JSON.parse(actual);
      if (typeof aJson === "string" && (aJson === expected || aJson === this.stripQuotes(expected))) {
        return true;
      }
    } catch {}

    // 5. Compare stripped of all internal whitespace if strings or arrays
    const aStripped = actual.replace(/\s+/g, "");
    const eStripped = expected.replace(/\s+/g, "");
    if (aStripped === eStripped) return true;
    if (this.stripQuotes(aStripped) === this.stripQuotes(eStripped)) return true;

    // 6. Floating point / number tolerance
    const actualNum = Number(this.stripQuotes(actual));
    const expectedNum = Number(this.stripQuotes(expected));
    if (!isNaN(actualNum) && !isNaN(expectedNum)) {
      if (Math.abs(actualNum - expectedNum) < 1e-5) {
        return true;
      }
    }

    return false;
  }
}
