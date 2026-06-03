export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export const ErrorCodes = {
  INVALID_REQUEST: "INVALID_REQUEST",
  INVALID_QUANTITY: "INVALID_QUANTITY",
  UNKNOWN_PRODUCT: "UNKNOWN_PRODUCT",
  EMPTY_CART: "EMPTY_CART",
  UNKNOWN_DISCOUNT_CODE: "UNKNOWN_DISCOUNT_CODE",
  DISCOUNT_CODE_USED: "DISCOUNT_CODE_USED",
  MILESTONE_NOT_ELIGIBLE: "MILESTONE_NOT_ELIGIBLE",
  MILESTONE_ALREADY_ISSUED: "MILESTONE_ALREADY_ISSUED",
} as const;
