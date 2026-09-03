export type Severity = 'critical' | 'warning' | 'info';

export interface ReviewComment {
  id: string;
  line: number;
  file: string;
  severity: Severity;
  title: string;
  message: string;
}

export interface ReviewResponse {
  summary: string;
  comments: ReviewComment[];
}

// A realistic mock response representing an AI-generated code review
export const simulateReview = async (diff: string, language: string): Promise<ReviewResponse> => {
  // Simulate network delay and "AI processing" time
  await new Promise((resolve) => setTimeout(resolve, 2000));

  if (!diff.trim()) {
    throw new Error('Diff cannot be empty.');
  }

  // Dynamically find a valid line number in the diff to ensure clicking works.
  // We look for the first hunk header e.g. @@ -12,3 +45,4 @@
  let startLine = 10;
  const hunkMatch = diff.match(/@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
  if (hunkMatch && hunkMatch[1]) {
    startLine = parseInt(hunkMatch[1], 10);
  }

  return {
    summary: 'Found 3 potential issues in your code, including one critical vulnerability.',
    comments: [
      {
        id: 'c1',
        line: startLine + 3,
        file: 'mock_file',
        severity: 'critical',
        title: 'Security Vulnerability / Null Risk',
        message: 'This line contains a critical flaw. Ensure inputs are validated and sanitized before execution to prevent runtime crashes or injection attacks.'
      },
      {
        id: 'c2',
        line: startLine + 4,
        file: 'mock_file',
        severity: 'warning',
        title: 'Redundant Logic',
        message: 'This assignment appears redundant or inefficient. Consider refactoring to return the expression directly to simplify the flow.'
      },
      {
        id: 'c3',
        line: startLine + 1,
        file: 'mock_file',
        severity: 'info',
        title: 'Type Hinting / Documentation',
        message: 'Consider adding explicit type hints or inline documentation for better readability and static analysis.'
      }
    ]
  };
};
