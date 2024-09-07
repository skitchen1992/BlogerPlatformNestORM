export const dataSetUpdateBlog = {
  name: 'New test',
  description: 'New Test description',
  websiteUrl: 'https://string.ru',
};

export const dataSetNewBlog1 = {
  name: 'Test very long string in the world',
  description: 'Test description',
  websiteUrl: 'https://string.com',
};

export const errorDataSet1 = {
  errorsMessages: [
    {
      message: 'Name must be between 1 and 15 characters',
      field: 'name',
    },
  ],
};

export const dataSetNewBlog2 = {
  name: null,
  description: 'Test description',
  websiteUrl: 'https://string.com',
};

export const errorDataSet2 = {
  errorsMessages: [
    {
      message: 'Name is required',
      field: 'name',
    },
  ],
};

export const dataSetNewBlog3 = {
  description: 'Test description',
  websiteUrl: 'https://string.com',
};

export const errorDataSet3 = {
  errorsMessages: [
    {
      message: 'Name is required',
      field: 'name',
    },
  ],
};

export const dataSetNewBlog4 = {
  name: 'Test name',
  description:
    'Test very long string in the world Test very long string in the world Test very long string in the world Test very long string in the world Test very long string in the world Test very long string in the world Test very long string in the world Test very long string in the world Test very long string in the world Test very long string in the world Test very long string in the world Test very long string in the world Test very long string in the world Test very long string in the world Test very long string in the world Test very long string in the world Test very long string in the world Test very long string in the world Test very long string in the world',
  websiteUrl: 'https://string.com',
};

export const errorDataSet4 = {
  errorsMessages: [
    {
      message: 'Description must be between 1 and 500 characters',
      field: 'description',
    },
  ],
};

export const dataSetNewBlog5 = {
  name: 'Test name',
  description: {},
  websiteUrl: 'https://string.com',
};

export const errorDataSet5 = {
  errorsMessages: [
    {
      message: 'Description must be between 1 and 500 characters',
      field: 'description',
    },
  ],
};

export const dataSetNewBlog6 = {
  name: 'Test name',
  websiteUrl: 'https://string.com',
};

export const errorDataSet6 = {
  errorsMessages: [
    {
      message: 'Description is required',
      field: 'description',
    },
  ],
};

export const dataSetNewBlog7 = {
  name: 'Test name',
  description: 'Test description',
  websiteUrl: 'https://string',
};

export const errorDataSet7 = {
  errorsMessages: [
    {
      message: 'websiteUrl must be a URL address',
      field: 'websiteUrl',
    },
  ],
};
