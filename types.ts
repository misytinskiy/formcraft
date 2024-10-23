import { Prisma } from "@prisma/client";

export type FormWithRelations = Prisma.FormGetPayload<{
  include: {
    author: true;
    questions: true;
    tags: true;
    responses: true;
  };
}>;
