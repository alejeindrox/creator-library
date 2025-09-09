export type LoginState = {
  errors?: {
    email?: string[];
  };
  message?: string | null;
};

export type LoginFormProps = {
  action: (payload: FormData) => void;
  state: LoginState;
};
