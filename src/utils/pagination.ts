export const getPageCount = (totalCount: number, pageSize: number) => {
  return Math.ceil(totalCount / pageSize);
};
