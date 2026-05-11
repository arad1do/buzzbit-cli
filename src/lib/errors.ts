/**
 * Typed errors raised by the CLI. Each maps to a non-zero exit code so
 * scripts can branch on failures cleanly.
 *
 *   1 — generic CLI error (default)
 *   2 — auth missing / invalid
 *   3 — MCP server returned an error
 *   4 — input validation error (bad flags / args)
 *   5 — network / transport error
 */

export type ExitCode = 1 | 2 | 3 | 4 | 5;

export class CliError extends Error {
  readonly exitCode: ExitCode;
  constructor(message: string, exitCode: ExitCode = 1) {
    super(message);
    this.name = 'CliError';
    this.exitCode = exitCode;
  }
}

export class AuthError extends CliError {
  constructor(message: string) {
    super(message, 2);
    this.name = 'AuthError';
  }
}

export class McpError extends CliError {
  readonly code: string | undefined;
  constructor(message: string, code?: string) {
    super(message, 3);
    this.name = 'McpError';
    this.code = code;
  }
}

export class ValidationError extends CliError {
  constructor(message: string) {
    super(message, 4);
    this.name = 'ValidationError';
  }
}

export class TransportError extends CliError {
  constructor(message: string) {
    super(message, 5);
    this.name = 'TransportError';
  }
}
