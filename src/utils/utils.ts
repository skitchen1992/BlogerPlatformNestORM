import { v4 as uuidv4 } from 'uuid';

export const getUniqueId = () => {
  return uuidv4();
};

export function sleep(duration: number): Promise<any> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), duration);
  });
}
