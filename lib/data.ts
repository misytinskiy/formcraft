import { prisma } from "./prisma";
import { FormWithRelations } from "@/types";

export async function fetchAllForms() {
  try {
    const forms = await prisma.form.findMany({
      include: {
        author: true,
        questions: true,
        tags: true,
      },
    });
    return forms;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch forms.");
  }
}

export async function fetchFormById(
  id: string
): Promise<FormWithRelations | null> {
  try {
    const form = await prisma.form.findUnique({
      where: { id },
      include: {
        author: true,
        questions: true,
        tags: true,
        responses: true,
      },
    });
    return form;
  } catch (error) {
    console.error("Database Error:", error);
    return null;
  }
}

export async function fetchAllFormsData() {
  try {
    const forms = await prisma.form.findMany({
      include: {
        questions: true,
        responses: true,
        author: true,
      },
    });
    return forms;
  } catch (error) {
    console.error("Error fetching forms data:", error);
    return [];
  }
}
