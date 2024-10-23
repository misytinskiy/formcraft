"use server";

import { supabase } from "@/lib/supabaseClient";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { v4 as uuidv4 } from "uuid";

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

  // Проверка, что поле title заполнено
  if (!title) {
    throw new Error("Поле 'title' обязательно для заполнения.");
  }

  // Получение идентификатора пользователя
  const { userId } = auth();
  if (!userId) {
    throw new Error("Пользователь не авторизован.");
  }

  // Получение данных пользователя из Clerk
  const user = await clerkClient.users.getUser(userId);

  // Создание или обновление пользователя в базе данных Supabase
  const { error: createUserError } = await supabase.from("User").upsert({
    id: userId,
    email: user.emailAddresses[0].emailAddress,
    name: user.firstName
      ? `${user.firstName} ${user.lastName}`
      : user.username || user.emailAddresses[0].emailAddress,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  if (createUserError) {
    throw new Error(
      "Не удалось создать пользователя: " + createUserError.message
    );
  }

  // Вставка данных формы в Supabase
  const { data: newForm, error: createFormError } = await supabase
    .from("Form")
    .insert({
      id: uuidv4(), // Генерация уникального ID формы
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

  // Перенаправление пользователя на страницу с формой после создания
  redirect(`/dashboard/forms/${newForm.id}`);
}

function buildQuestionsData(formData: FormData) {
  const questionIds = formData.getAll("questionIds[]");
  return questionIds.map((qid, index) => {
    const id = uuidv4();
    const title = formData.get(`questionTitle_${qid}`)?.toString() || "";
    const type = formData.get(`questionType_${qid}`)?.toString() as
      | "SINGLE_LINE_TEXT"
      | "MULTI_LINE_TEXT"
      | "POSITIVE_INTEGER"
      | "CHECKBOX"
      | "RADIO_BUTTON";
    const isRequired = formData.get(`questionRequired_${qid}`) === "on";
    const options = formData
      .getAll(`questionOptions_${qid}[]`)
      .map((option) => option.toString());
    return { id, title, type, isRequired, options, order: index + 1 };
  });
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

  // Преобразуем теги в массив строк
  const tagsString = formData.get("tags")?.toString() || "";
  const tags = tagsString
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

  // Проверка, что поле title заполнено
  if (!title) {
    throw new Error("Поле 'title' обязательно для заполнения.");
  }

  const questions = buildQuestionsData(formData); // Используем questions для обновления вопросов

  // Обновление формы в Supabase
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
    throw new Error("Не удалось обновить форму: " + updateFormError.message);
  }

  // Обновление или вставка вопросов
  for (const questionData of questions) {
    const { error: updateQuestionError } = await supabase
      .from("Question")
      .upsert({
        id: uuidv4(),
        formId,
        title: questionData.title,
        type: questionData.type,
        isRequired: questionData.isRequired,
        options: questionData.options,
        order: questionData.order,
      });

    if (updateQuestionError) {
      throw new Error(
        "Не удалось обновить вопросы: " + updateQuestionError.message
      );
    }
  }

  // Добавление или обновление тегов для формы
  if (tags.length > 0) {
    // Здесь предполагается, что есть отдельная таблица для тегов или связь между тегами и формами
    const { error: updateTagsError } = await supabase.from("FormTags").upsert(
      tags.map((tag) => ({
        formId,
        tagName: tag,
      }))
    );

    if (updateTagsError) {
      throw new Error("Не удалось обновить теги: " + updateTagsError.message);
    }
  }

  // Перенаправление после успешного обновления
  redirect(`/dashboard/forms/${formId}`);
}

// Функция для удаления формы
export async function deleteForm(formId: string): Promise<void> {
  const { error } = await supabase.from("Form").delete().eq("id", formId);

  if (error) {
    throw new Error("Не удалось удалить форму: " + error.message);
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
