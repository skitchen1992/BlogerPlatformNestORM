import { ID } from '../../mocks/mocks';

export const dataSetNewPost0 = {
  title: 'Title',
  shortDescription: 'ShortDescription',
  content: 'Content',
  blogId: ID,
};

export const errorDataSet0 = {
  errorsMessages: [
    {
      message: `Blog id ${ID} not founded`,
      field: 'blogId',
    },
  ],
};

export const dataSetNewPost1 = {
  title:
    'Title very long string in the world very long string in the world Title very long string in the world very long string in the world',
  shortDescription: 'ShortDescription',
  content: 'Content',
  blogId: ID,
};

export const errorDataSet1 = {
  errorsMessages: [
    {
      message: 'Title must be between 1 and 30 characters',
      field: 'title',
    },
  ],
};

export const dataSetNewPost2 = {
  title: null,
  shortDescription: 'ShortDescription',
  content: 'Content',
  blogId: ID,
};

export const errorDataSet2 = {
  errorsMessages: [
    {
      message: 'Title is required',
      field: 'title',
    },
  ],
};

export const dataSetNewPost3 = {
  shortDescription: 'ShortDescription',
  content: 'Content',
  blogId: ID,
};

export const errorDataSet3 = {
  errorsMessages: [
    {
      message: 'Title must be between 1 and 30 characters',
      field: 'title',
    },
  ],
};

export const dataSetNewPost4 = {
  title: 'Title',
  shortDescription:
    'Title very long string in the world very long string in the world Title very long string in the world very long string in the world',
  content: 'Content',
  blogId: ID,
};

export const errorDataSet4 = {
  errorsMessages: [
    {
      message: 'ShortDescription is required',
      field: 'shortDescription',
    },
  ],
};

export const dataSetNewPost5 = {
  title: 'Title',
  shortDescription: null,
  content: 'Content',
  blogId: ID,
};

export const errorDataSet5 = {
  errorsMessages: [
    {
      message: 'ShortDescription must be between 1 and 100 characters',
      field: 'shortDescription',
    },
  ],
};

export const dataSetNewPost6 = {
  title: 'Title',
  content: 'Content',
  blogId: ID,
};

export const errorDataSet6 = {
  errorsMessages: [
    {
      message: 'ShortDescription is required',
      field: 'shortDescription',
    },
  ],
};

export const dataSetNewPost7 = {
  title: 'Title',
  shortDescription: 'Short Description',
  content:
    'Title very long string in the world very long string in the world Title very long string in the world very long string in the world, Title very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the worldTitle very long string in the world very long string in the world Title very long string in the world very long string in the world',
  blogId: ID,
};

export const errorDataSet7 = {
  errorsMessages: [
    {
      message: 'Content must be between 1 and 1000 characters',
      field: 'content',
    },
  ],
};

export const dataSetNewPost8 = {
  title: 'Title',
  shortDescription: 'Short Description',
  content: null,
  blogId: ID,
};

export const errorDataSet8 = {
  errorsMessages: [
    {
      message: 'Content is required',
      field: 'content',
    },
  ],
};

export const dataSetNewPost9 = {
  title: 'Title',
  shortDescription: 'Short Description',
  blogId: ID,
};

export const errorDataSet9 = {
  errorsMessages: [
    {
      message: 'Content must be between 1 and 1000 characters',
      field: 'content',
    },
  ],
};

export const dataSetNewPost10 = {
  title: 'Title',
  shortDescription: 'Short Description',
  content: 'Content',
  blogId: ID,
  test: 1,
};

export const dataSetUpdatePost = {
  title: 'Title',
  shortDescription: 'Short Description',
  content: 'Content',
  blogId: ID,
};

export const errorDataSet11 = {
  errorsMessages: [
    {
      message: 'Title is required',
      field: 'title',
    },
  ],
};

export const errorDataSet12 = {
  errorsMessages: [
    {
      message: 'ShortDescription must be between 1 and 100 characters',
      field: 'shortDescription',
    },
  ],
};

export const errorDataSet13 = {
  errorsMessages: [
    {
      message: 'ShortDescription is required',
      field: 'shortDescription',
    },
  ],
};

export const errorDataSet14 = {
  errorsMessages: [
    {
      message: 'Content is required',
      field: 'content',
    },
  ],
};

export const errorDataSet15 = {
  errorsMessages: [
    {
      message: 'Title must be between 1 and 30 characters',
      field: 'title',
    },
  ],
};

export const errorDataSet16 = {
  errorsMessages: [
    {
      message: 'ShortDescription must be between 1 and 100 characters',
      field: 'shortDescription',
    },
  ],
};

export const errorDataSet17 = {
  errorsMessages: [
    {
      message: 'ShortDescription must be between 1 and 100 characters',
      field: 'shortDescription',
    },
  ],
};

export const errorDataSet18 = {
  errorsMessages: [
    {
      message: 'Content must be between 1 and 1000 characters',
      field: 'content',
    },
  ],
};
