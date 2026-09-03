export type Severity = 'critical' | 'warning' | 'info';

export interface ReviewComment {
  id: string;
  line: number; // For simplicity, we just use a target line number
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
  await new Promise((resolve) => setTimeout(resolve, 3000));

  if (!diff.trim()) {
    throw new Error('Diff cannot be empty.');
  }

  // We return a set of comments. In a real system, these line numbers would accurately map
  // to the lines in the provided diff string. For the mock, we assume standard git diff line numbers.
  return {
    summary: 'Found 3 potential issues in your code, including one critical null reference risk that needs immediate attention.',
    comments: [
      {
        id: 'c1',
        line: 11,
        file: 'src/main.py',
        severity: 'critical',
        title: 'Possible Null Reference',
        message: 'Ensure that `price` is validated before addition. If `price` is None, this will throw a TypeError at runtime.'
      },
      {
        id: 'c2',
        line: 12,
        file: 'src/main.py',
        severity: 'warning',
        title: 'Redundant Variable',
        message: 'Assigning to `total` and immediately returning it is redundant. Consider returning the expression directly to simplify the flow.'
      },
      {
        id: 'c3',
        line: 10,
        file: 'src/main.py',
        severity: 'info',
        title: 'Type Hinting Missing',
        message: 'Consider adding type hints (e.g., `price: float, tax: float -> float`) to the function arguments for better readability and static analysis.'
      }
    ]
  };
};
