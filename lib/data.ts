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
    // Запрашиваем форму, реляционные данные автора и вопросы
    const { data: form, error } = await supabase
      .from("Form")
      .select(
        `
        id, title, description, topic, imageUrl, isPublic, createdAt, updatedAt,
        author:authorId (id, name, email, role, status, createdAt, updatedAt),
        Question(id, title, description, type, isRequired, order, options, formId),
        Response(id, answers, createdAt, formId)
      `
      )
      .eq("id", id)
      .single(); // Гарантируем, что запрос вернет только одну форму

    if (error) {
      throw new Error("Failed to fetch form: " + error.message);
    }

    if (!form) {
      return null;
    }

    // Если автор является массивом, извлекаем первый элемент
    const author =
      form.author && Array.isArray(form.author) ? form.author[0] : form.author;

    // Преобразуем данные формы в ожидаемый формат
    const transformedForm: FormWithRelations = {
      ...form,
      authorId: author?.id || "", // Получаем id автора
      author: author || null, // Присваиваем объект автора
      questions: form.Question || [], // Присваиваем вопросы формы
      responses: form.Response || [], // Присваиваем ответы формы
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

// Функция для получения форм, которые заполнил пользователь
export async function fetchFilledForms(
  userId: string
): Promise<FormWithRelations[]> {
  try {
    // Сначала получаем все формы, на которые есть ответы пользователя
    const { data: responses, error: responseError } = await supabase
      .from("Response")
      .select("formId")
      .eq("userId", userId); // Фильтруем ответы по пользователю

    if (responseError) {
      throw new Error(
        "Ошибка при получении заполненных форм: " + responseError.message
      );
    }

    if (!responses || responses.length === 0) return [];

    const formIds = responses.map((response) => response.formId);

    // Затем находим формы по их ID
    const { data: forms, error: formError } = await supabase
      .from("Form")
      .select(
        `
        id, title, description, topic, imageUrl, isPublic, createdAt, updatedAt,
        author:authorId (id, name, email),
        Question (id, title, description, type, isRequired, order, options)
      `
      )
      .in("id", formIds); // Используем IDs заполненных форм

    if (formError) {
      throw new Error(
        "Ошибка при получении заполненных форм: " + formError.message
      );
    }

    if (!forms) return [];

    return forms.map((form: any) => ({
      ...form,
      authorId: form.author?.id || "",
      author: form.author || null,
      questions: form.Question || [],
    }));
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Не удалось получить заполненные формы.");
  }
}

// Функция для получения форм, созданных пользователем
export async function fetchUserCreatedForms(
  userId: string
): Promise<FormWithRelations[]> {
  try {
    const { data: forms, error } = await supabase
      .from("Form")
      .select(
        `
        id, title, description, topic, imageUrl, isPublic, createdAt, updatedAt,
        author:authorId (id, name, email),
        Question (id, title, description, type, isRequired, order, options)
      `
      )
      .eq("authorId", userId); // Фильтруем по автору

    if (error) {
      throw new Error("Ошибка при получении созданных форм: " + error.message);
    }

    if (!forms) return [];

    return forms.map((form: any) => ({
      ...form,
      authorId: form.author?.id || "",
      author: form.author || null,
      questions: form.Question || [],
    }));
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Не удалось получить созданные формы.");
  }
}
