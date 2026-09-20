export interface Book {
  id: number;
  title: string;
  authorId: number;
  publishedDate?: string;
}

export const books: Book[] = [];

let nextId = 1;

export function getNextBookId() {
  return nextId++;
}