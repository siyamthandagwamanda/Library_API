export interface Author {
  id: number;
  name: string;
  bio?: string;
  birthDate?: string;
}

export const authors: Author[] = [];

let idCounter = 1;
export const getNextAuthorId = () => idCounter++;