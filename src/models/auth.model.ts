export interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

export interface SendEmailParams {
  to: string;
  name: string;
  token: string;
}

export type VerificationTokenType = "EMAIL_VERIFICATION" | "PASSWORD_RESET";

export interface VerificationTokenRecord {
  id: string;
  token: string;
  type: VerificationTokenType;
  userId: string;
  expiresAt: Date;
}

export interface CreateVerificationTokenPayload {
  userId: string;
  type: VerificationTokenType;
}

export interface ValidateTokenPayload {
  token: string;
  type: VerificationTokenType;
}
