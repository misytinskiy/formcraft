"use server";

import { supabase } from "@/lib/supabaseClient";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { v4 as uuidv4 } from "uuid";
import { Question, QuestionType } from "@/types";

// Функция для отправки данных формы (ответов)
export async function addFormData(formData: FormData): Promise<void> {
  const sanitizedData = sanitizeFormData(formData);
  const formId = sanitizedData.get("formId")?.toString();

  if (!formId) {
    throw new Error("Отсутствует идентификатор формы.");
  }

  const answers: Record<string, string> = {};
  sanitizedData.forEach((value, key) => {
    if (!key.startsWith("$ACTION") && key !== "formId") {
      answers[key] = value.toString();
    }
  });

  const { userId } = auth();

  const { error } = await supabase.from("Response").insert({
    id: uuidv4(),
    formId,
    answers,
    userId: userId ?? null,
    createdAt: new Date().toISOString(),
  });

  if (error) {
    throw new Error("Не удалось отправить данные формы: " + error.message);
  }

  redirect(`/forms/${formId}/success`);
}

function sanitizeFormData(formData: FormData): FormData {
  const sanitized = new FormData();
  formData.forEach((value, key) => {
    if (typeof value === "string") {
      sanitized.append(key, value.replace(/\0/g, ""));
    } else {
      sanitized.append(key, value);
    }
  });
  return sanitized;
}

// Функция для создания новой формы
export async function createForm(formData: FormData): Promise<void> {
  const title = formData.get("title")?.toString() || "";
  const description = formData.get("description")?.toString() || "";
  const isPublic = formData.get("isPublic") === "on";
  const topic = formData.get("topic")?.toString() || "";
  const imageUrl = formData.get("imageUrl")?.toString() || "";

  if (!title) {
    throw new Error("Поле 'title' обязательно для заполнения.");
  }

  const { userId } = auth();
  if (!userId) {
    throw new Error("Пользователь не авторизован.");
  }

  const { data: newForm, error: createFormError } = await supabase
    .from("Form")
    .insert({
      id: uuidv4(),
      title,
      description,
      isPublic,
      topic,
      imageUrl,
      authorId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .select()
    .single();

  if (createFormError) {
    throw new Error("Не удалось создать форму: " + createFormError.message);
  }

  const questionIds = formData.getAll("questionIds[]");
  console.log("Question IDs:", questionIds);

  if (!questionIds.length) {
    console.log("No questions were found in formData");
    throw new Error("Нет вопросов для добавления в форму.");
  }

  const questions = questionIds.map((qid, index) => {
    const id = uuidv4();
    const title = formData.get(`questionTitle_${qid}`)?.toString() || "";
    const type = formData.get(`questionType_${qid}`)?.toString() || "TEXT";
    const isRequired = formData.get(`questionRequired_${qid}`) === "on";
    const options = formData
      .getAll(`questionOptions_${qid}[]`)
      .map((option) => option.toString());

    console.log(
      "Question Title:",
      title,
      "Type:",
      type,
      "Is Required:",
      isRequired
    );
    console.log("Options for question:", options);

    return {
      id,
      formId: newForm.id,
      title,
      type,
      isRequired,
      options,
      order: index + 1,
    };
  });

  const uniqueQuestions = Array.from(
    new Map(questions.map((q) => [q.title, q])).values()
  );

  const { error: insertQuestionsError } = await supabase
    .from("Question")
    .insert(uniqueQuestions);

  if (insertQuestionsError) {
    throw new Error(
      "Не удалось добавить вопросы: " + insertQuestionsError.message
    );
  }

  redirect(`/dashboard/forms/${newForm.id}`);
}

function buildQuestionsData(formData: FormData, formId: string): Question[] {
  const questionIds = formData.getAll("questionIds[]");
  const questions: Question[] = questionIds.map((qid, index) => {
    const title = formData.get(`questions[${index}][title]`)?.toString() || "";
    const type = formData.get(`questions[${index}][type]`)?.toString() || "";
    const isRequired = formData.get(`questions[${index}][isRequired]`) === "on";
    const options = formData
      .getAll(`questions[${index}][options][]`)
      .map((opt) => opt.toString());

    return {
      id: qid.toString() || uuidv4(),
      formId,
      title,
      type: type as QuestionType,
      isRequired,
      options,
      order: index + 1,
    };
  });

  return questions;
}

// Функция для обновления существующей формы
export async function updateForm(
  formId: string,
  formData: FormData
): Promise<void> {
  const title = formData.get("title")?.toString() || "";
  const description = formData.get("description")?.toString() || "";
  const isPublic = formData.get("isPublic") === "on";
  const topic = formData.get("topic")?.toString() || "";
  const imageUrl = formData.get("imageUrl")?.toString() || "";

  // Получаем вопросы
  const questions = buildQuestionsData(formData, formId);

  if (!title) {
    throw new Error("Title is required.");
  }

  const { error: updateFormError } = await supabase
    .from("Form")
    .update({
      title,
      description,
      isPublic,
      topic,
      imageUrl,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", formId);

  if (updateFormError) {
    console.error("Form update error:", updateFormError.message); // Логируем ошибку
    throw new Error("Failed to update form: " + updateFormError.message);
  }

  // Обновляем или вставляем вопросы
  for (const questionData of questions) {
    const { error: updateQuestionError } = await supabase
      .from("Question")
      .upsert({
        id: questionData.id || uuidv4(),
        formId: questionData.formId,
        title: questionData.title,
        type: questionData.type,
        isRequired: questionData.isRequired,
        options: questionData.options,
        order: questionData.order,
      });

    if (updateQuestionError) {
      console.error("Question upsert error:", updateQuestionError.message);
      throw new Error(
        "Failed to update questions: " + updateQuestionError.message
      );
    }
  }
}

// Функция для удаления формы
export async function deleteForm(formId: string): Promise<void> {
  //  удаляем связанные ответы
  const { error: responseError } = await supabase
    .from("Response")
    .delete()
    .eq("formId", formId);

  if (responseError) {
    throw new Error(
      "Не удалось удалить связанные ответы: " + responseError.message
    );
  }

  // удаляем связанные вопросы
  const { error: questionError } = await supabase
    .from("Question")
    .delete()
    .eq("formId", formId);

  if (questionError) {
    throw new Error(
      "Не удалось удалить связанные вопросы: " + questionError.message
    );
  }

  // удаляем саму форму
  const { error: formError } = await supabase
    .from("Form")
    .delete()
    .eq("id", formId);

  if (formError) {
    throw new Error("Не удалось удалить форму: " + formError.message);
  }

  redirect(`/dashboard`);
}

// Функция для добавления комментария к форме
export async function addComment(
  formId: string,
  content: string,
  authorId: string
): Promise<void> {
  const { error } = await supabase.from("Comment").insert({
    id: uuidv4(),
    formId,
    content,
    authorId,
    createdAt: new Date().toISOString(),
  });

  if (error) {
    throw new Error("Не удалось добавить комментарий: " + error.message);
  }
}

// Функция для переключения лайка на форме
export async function toggleLike(
  formId: string,
  userId: string
): Promise<void> {
  const { data: existingLike } = await supabase
    .from("Like")
    .select("id")
    .eq("formId", formId)
    .eq("userId", userId)
    .single();

  if (existingLike) {
    const { error: deleteError } = await supabase
      .from("Like")
      .delete()
      .eq("id", existingLike.id);

    if (deleteError) {
      throw new Error("Не удалось удалить лайк: " + deleteError.message);
    }
  } else {
    const { error: insertError } = await supabase.from("Like").insert({
      id: uuidv4(),
      formId,
      userId,
      createdAt: new Date().toISOString(),
    });

    if (insertError) {
      throw new Error("Не удалось добавить лайк: " + insertError.message);
    }
  }
}

// Функция для поиска форм
export async function searchForms(query: string) {
  const { data: forms, error } = await supabase
    .from("Form")
    .select(
      `
      id, title, description, topic, tags(name),
      author(id, name, email), questions(id, title, type)
    `
    )
    .ilike("title", `%${query}%`)
    .ilike("description", `%${query}%`)
    .ilike("tags.name", `%${query}%`);

  if (error) {
    console.error("Ошибка базы данных:", error);
    return [];
  }

  return forms;
}
