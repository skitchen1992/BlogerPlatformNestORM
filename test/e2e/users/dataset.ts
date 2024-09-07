export const dataSetNewUser1 = {
  login: 'T',
  password: 'ShortDescription',
  email: 'test@gmail.com',
};

export const errorDataSet1 = {
  errorsMessages: [
    {
      message: 'Login must be between 3 and 10 characters',
      field: 'login',
    },
  ],
};

export const dataSetNewUser2 = {
  login: 'Login',
  password: 'ShortDescriptionsdfsdfsdfsdfsdfsdfsdfsdfsdfsd',
  email: 'test@gmail.com',
};

export const errorDataSet2 = {
  errorsMessages: [
    {
      message: 'Password must be between 6 and 20 characters',
      field: 'password',
    },
  ],
};

export const dataSetNewUser3 = {
  login: 'Login',
  password: 'ShortDescrip',
  email: 'testmailcom',
};

export const errorDataSet3 = {
  errorsMessages: [
    {
      message: 'Email must be a valid email address',
      field: 'email',
    },
  ],
};
