export type BffErrorCode =
  | "LOGIN_REQUIRED"
  | "LOGIN_EXPIRED"
  | "NO_COPYRIGHT"
  | "RATE_LIMITED"
  | "UPSTREAM_ERROR";

export type BffError = {
  code: BffErrorCode;
  message: string;
};

export type BffOk<T> = { ok: true; data: T };
export type BffFail = { ok: false; error: BffError };
export type BffResponse<T> = BffOk<T> | BffFail;

export function ok<T>(data: T): BffOk<T> {
  return { ok: true, data };
}

export function fail(code: BffErrorCode, message: string): BffFail {
  return { ok: false, error: { code, message } };
}

export function upstreamError(message = "Upstream error"): BffFail {
  return fail("UPSTREAM_ERROR", message);
}

