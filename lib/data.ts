import { supabase } from "@/lib/supabaseClient";
import { Form, User, Question, Response } from "@/types";

interface FormWithRelations extends Form {
  author: User;
  questions: Question[];
  responses: Response[];
}

export async function fetchAllForms(): Promise<FormWithRelations[]> {
  try {
    const { data: forms, error } = await supabase.from("Form").select(`
        id, title, description, topic, imageUrl, isPublic, createdAt, updatedAt,
        author:authorId (id, name, email),
        Question (id, title, description, type, isRequired, order, options)
      `);

    if (error) {
      throw new Error("Failed to fetch forms: " + error.message);
    }

    if (!forms) {
      console.log("No forms returned");
      return [];
    }

    const transformedForms = forms.map((form: any) => {
      return {
        ...form,
        authorId: form.author?.id || "",
        author: form.author || null,
        questions: form.Question || [],
      };
    });

    return transformedForms;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch forms.");
  }
}

// Получение формы по ID с реляционными данными
export async function fetchFormById(
  id: string
): Promise<FormWithRelations | null> {
  try {
    const { data: form, error } = await supabase
      .from("Form")
      .select(
        `
        id, title, description, topic, imageUrl, isPublic, createdAt, updatedAt,
        author:authorId (id, name, email),
        Question(id, title, description, type, isRequired, order, options, formId),
        Response(id, answers, createdAt, formId)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      throw new Error("Failed to fetch form: " + error.message);
    }

    if (!form) {
      return null;
    }

    const transformedForm: FormWithRelations = {
      ...form,
      authorId: form.author?.id || "",
      author: form.author || null,
      questions: form.Question || [],
      responses: form.Response || [],
    };

    return transformedForm;
  } catch (error) {
    console.error("Database Error:", error);
    return null;
  }
}

// Получение всех форм с вопросами и ответами
export async function fetchAllFormsData(): Promise<FormWithRelations[]> {
  try {
    const { data: forms, error } = await supabase.from("Form").select(`
        id, title, description, topic, imageUrl, isPublic, createdAt, updatedAt,
        author:authorId (id, name, email),
        Question(id, title, description, type, isRequired, order, options, formId),
        Response(id, answers, createdAt, formId)
      `);

    if (error) {
      throw new Error("Error fetching forms data: " + error.message);
    }

    if (!forms) return [];

    const transformedForms = forms.map((form: any) => ({
      ...form,
      authorId: form.author?.id || "",
      author: form.author || null,
      questions: form.Question || [],
      responses: form.Response || [],
    }));

    return transformedForms;
  } catch (error) {
    console.error("Error fetching forms data:", error);
    return [];
  }
}

export async function fetchFormResponses(formId: string): Promise<Response[]> {
  try {
    const { data: responses, error } = await supabase
      .from("Response")
      .select("*")
      .eq("formId", formId);

    if (error) {
      throw new Error("Ошибка при получении ответов: " + error.message);
    }

    return responses || [];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Не удалось получить ответы.");
  }
}

export async function fetchFormResponsesCount(formId: string): Promise<number> {
  try {
    const { data: responseCount, error } = await supabase
      .from("Response")
      .select("id", { count: "exact" })
      .eq("formId", formId);

    if (error) {
      throw new Error(
        "Ошибка при получении количества ответов: " + error.message
      );
    }

    return responseCount.length || 0;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Не удалось получить количество ответов.");
  }
}
