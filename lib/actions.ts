"use server";

import { prisma } from "./prisma";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { QuestionType } from "@prisma/client";

// Функция для отправки данных формы (ответов)
export async function addFormData(formData: FormData): Promise<void> {
  // Санитизируем данные
  const sanitizedData = sanitizeFormData(formData);

  const formId = sanitizedData.get("formId")?.toString();

  if (!formId) {
    throw new Error("Отсутствует идентификатор формы.");
  }

  // Собираем все данные формы из санитизированных данных
  const entries = Array.from(sanitizedData.entries());
  const answers: Record<string, string> = {};

  for (const [key, value] of entries) {
    if (key.startsWith("$ACTION") || key === "formId") continue;
    answers[key] = value.toString();
  }

  // Получаем userId из аутентификации (если интегрировано)
  const { userId } = auth();

  try {
    // Сохраняем ответ в базе данных
    await prisma.response.create({
      data: {
        formId,
        answers,
        userId: userId ?? null, // Используем userId или null, если пользователь не аутентифицирован
      },
    });
  } catch (error) {
    console.error("Ошибка базы данных:", error);
    throw new Error("Не удалось отправить данные формы.");
  }

  // Вызываем redirect вне блока try...catch
  redirect(`/forms/${formId}/success`);
}

function sanitizeFormData(formData: FormData): FormData {
  const sanitized = new FormData();
  const entries = Array.from(formData.entries());

  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    if (typeof value === "string") {
      // Удаляем нулевые байты
      sanitized.append(key, value.replace(/\0/g, ""));
    } else {
      sanitized.append(key, value);
    }
  }

  return sanitized;
}

// Функция для создания новой формы
export async function createForm(formData: FormData): Promise<void> {
  const title = formData.get("title")?.toString() || "";
  const description = formData.get("description")?.toString() || "";
  const isPublic = formData.get("isPublic") === "on";
  const topic = formData.get("topic")?.toString() || "";
  const imageUrl = formData.get("imageUrl")?.toString() || "";
  const tagsString = formData.get("tags")?.toString() || "";
  const tags = tagsString
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

  if (!title) {
    throw new Error("Поле 'title' обязательно для заполнения.");
  }

  // Получаем текущего пользователя
  const { userId } = auth();
  if (!userId) {
    throw new Error("Пользователь не авторизован.");
  }

  // Получаем данные пользователя из Clerk
  const user = await clerkClient.users.getUser(userId);

  // Проверяем, есть ли пользователь в нашей базе данных
  let dbUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!dbUser) {
    // Если нет, создаем пользователя в нашей базе данных
    dbUser = await prisma.user.create({
      data: {
        id: userId,
        email: user.emailAddresses[0].emailAddress,
        name: user.firstName
          ? `${user.firstName} ${user.lastName}`
          : user.username || user.emailAddresses[0].emailAddress,
        role: "USER",
        status: "ACTIVE",
      },
    });
  }

  // Собираем вопросы
  type QuestionData = {
    title: string;
    type: QuestionType;
    isRequired: boolean;
    options: string[];
    order: number;
  };

  const questionsData: QuestionData[] = [];
  const questionIds = formData.getAll("questionIds[]");

  questionIds.forEach((qid, index) => {
    const id = qid.toString();
    const questionTitle = formData.get(`questionTitle_${id}`)?.toString() || "";
    const questionTypeValue = formData.get(`questionType_${id}`)?.toString();

    if (!questionTitle) {
      throw new Error(`Поле 'title' обязательно для вопроса с ID ${id}.`);
    }

    if (
      !questionTypeValue ||
      !Object.values(QuestionType).includes(questionTypeValue as QuestionType)
    ) {
      throw new Error(`Некорректный тип вопроса для вопроса с ID ${id}.`);
    }

    const questionType = questionTypeValue as QuestionType;
    const isRequired = formData.get(`questionRequired_${id}`) === "on";
    const options = formData
      .getAll(`questionOptions_${id}[]`)
      .map((option) => option.toString());

    questionsData.push({
      title: questionTitle,
      type: questionType,
      isRequired,
      options,
      order: index + 1,
    });
  });

  let newForm;
  try {
    newForm = await prisma.form.create({
      data: {
        title,
        description,
        isPublic,
        topic,
        imageUrl,
        authorId: dbUser.id,
        tags: {
          connectOrCreate: tags.map((tagName) => ({
            where: { name: tagName },
            create: { name: tagName },
          })),
        },
        questions: {
          create: questionsData.map((q) => ({
            title: q.title,
            type: q.type,
            isRequired: q.isRequired,
            options: q.options,
            order: q.order,
          })),
        },
      },
    });
  } catch (error) {
    console.error("Ошибка базы данных:", error);
    throw new Error("Не удалось создать форму.");
  }

  // Вызываем redirect вне блока try...catch
  redirect(`/dashboard/forms/${newForm.id}`);
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
  const tags = formData.getAll("tags[]").map((tag) => tag.toString());

  if (!title) {
    throw new Error("Поле 'title' обязательно для заполнения.");
  }

  // Собираем обновлённые вопросы
  type QuestionUpdateData = {
    id?: string; // Может быть undefined для новых вопросов
    title: string;
    type: QuestionType;
    isRequired: boolean;
    options: string[];
    order: number;
  };

  const questionsData: QuestionUpdateData[] = [];
  const questionIds = formData.getAll("questionIds[]");

  questionIds.forEach((qid, index) => {
    const id = qid.toString();
    const questionTitle = formData.get(`questionTitle_${id}`)?.toString() || "";
    const questionTypeValue = formData.get(`questionType_${id}`)?.toString();

    if (!questionTitle) {
      throw new Error(`Поле 'title' обязательно для вопроса с ID ${id}.`);
    }

    if (
      !questionTypeValue ||
      !Object.values(QuestionType).includes(questionTypeValue as QuestionType)
    ) {
      throw new Error(`Некорректный тип вопроса для вопроса с ID ${id}.`);
    }

    const questionType = questionTypeValue as QuestionType;
    const isRequired = formData.get(`questionRequired_${id}`) === "on";
    const options = formData
      .getAll(`questionOptions_${id}[]`)
      .map((option) => option.toString());

    questionsData.push({
      id,
      title: questionTitle,
      type: questionType,
      isRequired,
      options,
      order: index + 1,
    });
  });

  try {
    // Обновляем форму
    await prisma.form.update({
      where: { id: formId },
      data: {
        title,
        description,
        isPublic,
        topic,
        imageUrl,
        tags: {
          set: [],
          connectOrCreate: tags.map((tagName) => ({
            where: { name: tagName },
            create: { name: tagName },
          })),
        },
      },
    });

    // Обновляем вопросы
    for (const questionData of questionsData) {
      if (questionData.id) {
        // Обновляем существующий вопрос
        await prisma.question.update({
          where: { id: questionData.id },
          data: {
            title: questionData.title,
            type: questionData.type,
            isRequired: questionData.isRequired,
            options: questionData.options,
            order: questionData.order,
          },
        });
      } else {
        // Создаём новый вопрос
        await prisma.question.create({
          data: {
            formId,
            title: questionData.title,
            type: questionData.type,
            isRequired: questionData.isRequired,
            options: questionData.options,
            order: questionData.order,
          },
        });
      }
    }

    redirect(`/dashboard/forms/${formId}`);
  } catch (error) {
    console.error("Ошибка базы данных:", error);
    throw new Error("Не удалось обновить форму.");
  }
}

// Функция для удаления формы
export async function deleteForm(formId: string): Promise<void> {
  try {
    await prisma.form.delete({
      where: { id: formId },
    });

    redirect(`/dashboard`);
  } catch (error) {
    console.error("Ошибка базы данных:", error);
    throw new Error("Не удалось удалить форму.");
  }
}

// Функция для добавления комментария к форме
export async function addComment(
  formId: string,
  content: string,
  authorId: string
): Promise<void> {
  try {
    await prisma.comment.create({
      data: {
        formId,
        content,
        authorId,
      },
    });
  } catch (error) {
    console.error("Ошибка базы данных:", error);
    throw new Error("Не удалось добавить комментарий.");
  }
}

// Функция для переключения лайка на форме
export async function toggleLike(
  formId: string,
  userId: string
): Promise<void> {
  try {
    const existingLike = await prisma.like.findFirst({
      where: {
        formId,
        userId,
      },
    });

    if (existingLike) {
      // Удаляем лайк
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
    } else {
      // Добавляем лайк
      await prisma.like.create({
        data: {
          formId,
          userId,
        },
      });
    }
  } catch (error) {
    console.error("Ошибка базы данных:", error);
    throw new Error("Не удалось обработать лайк.");
  }
}

// Функция для поиска форм
export async function searchForms(query: string) {
  try {
    const forms = await prisma.form.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          {
            tags: { some: { name: { contains: query, mode: "insensitive" } } },
          },
        ],
      },
      include: {
        author: true,
        questions: true,
        tags: true,
      },
    });

    return forms;
  } catch (error) {
    console.error("Ошибка базы данных:", error);
    return [];
  }
}
