// za registrovanje
export type UserCreationReq = {
  username: string;
  password: string;
};

export type UserCreationRes = {
  failed: false;
  user_id: string;
};

// za login
export type LoginReq = {
  username: string;
  password: string;
};

export type LoginRes = {
  failed: false;
  token: string;
};
