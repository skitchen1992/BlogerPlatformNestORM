export const createAuthorizationHeader = (
  username?: string,
  password?: string,
) => {
  const credentials = btoa(`${username}:${password}`);

  return {
    Authorization: `Basic ${credentials}`,
  };
};

export const createBearerAuthorizationHeader = (token?: string) => {
  return {
    Authorization: `Bearer ${token}`,
  };
};
