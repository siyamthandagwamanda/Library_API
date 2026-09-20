export interface Book {
  id: number;
  title: string;
  authorId: number;
  publishedDate?: string; // "YYYY-MM-DD"
}

export const books: Book[] = [];

let idCounter = 1;
export const getNextBookId = () => idCounter++;