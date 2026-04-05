export type AuthActionState = {
  error: string | null;
  ok: boolean;
  nextPath: string | null;
  fields: {
    email: string;
    password: string;
    websiteUrl: string;
    referralCode: string;
  };
};

export type PasswordActionState = {
  ok: boolean;
  error: string | null;
  message: string | null;
  nextPath: string | null;
};
