export type User = {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "BLOCKED";
  createdAt: string;
  updatedAt: string;
};

export type Tag = {
  id: string;
  name: string;
};

export type Response = {
  id: string;
  formId: string;
  userId?: string;
  answers: Record<string, string | number | boolean>;
  createdAt: string;
};

export enum QuestionType {
  SINGLE_LINE_TEXT = "SINGLE_LINE_TEXT",
  MULTI_LINE_TEXT = "MULTI_LINE_TEXT",
  POSITIVE_INTEGER = "POSITIVE_INTEGER",
  CHECKBOX = "CHECKBOX",
  RADIO_BUTTON = "RADIO_BUTTON",
}

export type Question = {
  id: string;
  formId: string;
  title: string;
  description?: string;
  type: QuestionType;
  isRequired: boolean;
  order: number;
  options: string[];
};

export type Like = {
  id: string;
  formId: string;
  userId: string;
};

export type Form = {
  id: string;
  title: string;
  description?: string;
  topic: string;
  imageUrl?: string;
  isPublic: boolean;
  authorId: string;
  createdAt: string;
  updatedAt: string;
};

export type Comment = {
  id: string;
  content: string;
  formId: string;
  authorId: string;
  createdAt: string;
};

export interface FormWithRelations extends Form {
  author: User;
  questions: Question[];
  responses: Response[];
}
