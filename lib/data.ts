import { supabase } from "@/lib/supabaseClient";
import {
  Form,
  User,
  Question,
  Response,
  ResponseWithRelations,
  FormWithResponseCount,
} from "@/types";

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

export async function fetchAllResponses(): Promise<ResponseWithRelations[]> {
  try {
    const { data, error } = await supabase.from("Response").select(`
        id, createdAt, answers, formId,
        form:formId (
          id, title,
          questions:Question (
            id, title, description, type, isRequired, order, options
          )
        ),
        user:userId ( id, name, email )
      `);

    if (error) {
      throw new Error("Ошибка при получении ответов: " + error.message);
    }

    if (data) {
      const responses = data.map((response: any) => ({
        ...response,
        form: Array.isArray(response.form) ? response.form[0] : response.form,
        user: Array.isArray(response.user) ? response.user[0] : response.user,
      })) as ResponseWithRelations[];
      return responses;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Не удалось получить ответы.");
  }
}

export async function fetchFormsWithResponses(): Promise<
  FormWithResponseCount[]
> {
  try {
    const { data, error } = await supabase.from("Form").select(`
        id, title, description, topic, imageUrl, isPublic, authorId, createdAt, updatedAt,
        responses:Response (
          id
        )
      `);

    if (error) {
      throw new Error("Ошибка при получении форм: " + error.message);
    }

    if (data) {
      const forms = data.map((form: any) => ({
        ...form,
        responseCount: form.responses ? form.responses.length : 0,
      })) as FormWithResponseCount[];
      return forms;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Не удалось получить формы.");
  }
}

export async function fetchResponsesByFormId(
  formId: string
): Promise<ResponseWithRelations[]> {
  try {
    const { data, error } = await supabase
      .from("Response")
      .select(
        `
        id, createdAt, answers,
        form:formId (
          id, title,
          questions:Question (
            id, title, description, type, isRequired, order, options
          )
        ),
        user:userId ( id, name, email )
      `
      )
      .eq("formId", formId);

    if (error) {
      throw new Error("Ошибка при получении ответов: " + error.message);
    }

    if (data) {
      const responses = data.map((response: any) => ({
        ...response,
        form: Array.isArray(response.form) ? response.form[0] : response.form,
        user: Array.isArray(response.user) ? response.user[0] : response.user,
      })) as ResponseWithRelations[];
      return responses;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Не удалось получить ответы.");
  }
}

export async function getAggregatedResults(userId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from("Form")
    .select(
      `
      id,
      title,
      questions:Question(*),
      responses:Response(*)
    `
    )
    .eq("authorId", userId);

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return [];
  }

  // Обработка данных и вычисление агрегированных результатов
  const results = data.map((form) => {
    const numberOfAnswers = form.responses.length;
    const aggregatedResults = calculateAggregatedResults(
      form.responses,
      form.questions
    );

    return {
      id: form.id,
      title: form.title,
      numberOfAnswers,
      questions: form.questions, // Добавлено это поле
      aggregatedResults,
    };
  });

  return results;
}

function calculateAggregatedResults(responses: any[], questions: any[]) {
  const aggregatedResults: Record<string, any> = {};

  if (responses.length === 0) {
    return aggregatedResults;
  }

  questions.forEach((question: any) => {
    const questionId = question.id;
    const questionType = question.type; // Ваш реальный тип вопроса
    const answers = responses.map((response) => response.answers[questionId]);

    if (questionType === "POSITIVE_INTEGER") {
      const numbers = answers.map(Number).filter((n) => !isNaN(n));
      const sum = numbers.reduce((a, b) => a + b, 0);
      const average = sum / numbers.length;
      const min = Math.min(...numbers);
      const max = Math.max(...numbers);

      aggregatedResults[questionId] = {
        questionTitle: question.title,
        average,
        min,
        max,
      };
    } else if (
      questionType === "SINGLE_LINE_TEXT" ||
      questionType === "MULTI_LINE_TEXT" ||
      questionType === "CHECKBOX" ||
      questionType === "RADIO_BUTTON"
    ) {
      // Для текстовых ответов или вариантов подсчитываем частоту каждого ответа
      const frequency: Record<string, number> = {};
      answers.forEach((answer) => {
        if (Array.isArray(answer)) {
          // Если ответ - массив (например, для CHECKBOX)
          answer.forEach((ans) => {
            if (ans) {
              frequency[ans] = (frequency[ans] || 0) + 1;
            }
          });
        } else if (answer) {
          frequency[answer] = (frequency[answer] || 0) + 1;
        }
      });

      // Получаем несколько самых популярных ответов
      const popularAnswers = Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map((entry) => ({ answer: entry[0], count: entry[1] }));

      aggregatedResults[questionId] = {
        questionTitle: question.title,
        popularAnswers,
      };
    } else {
      // Обработка других типов вопросов, если есть
    }
  });

  return aggregatedResults;
}

export async function getUserById(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }

  return data as User;
}

export async function updateUser(userId: string, updates: Partial<User>) {
  const { error } = await supabase
    .from("User")
    .update(updates)
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }
}
