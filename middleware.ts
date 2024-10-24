import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabaseClient";
import { clerkClient } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = auth();

  if (userId) {
    console.log("Authenticated user ID:", userId);

    try {
      // Проверка, существует ли пользователь в таблице Supabase
      const { data: existingUser, error: selectError } = await supabase
        .from("User")
        .select("*")
        .eq("id", userId)
        .single();

      // Если произошла ошибка при запросе или пользователь не найден
      if (selectError && selectError.code !== "PGRST116") {
        // Проверяем, что ошибка не связана с "multiple rows" или отсутствием строки
        console.error(
          "Ошибка при выборке пользователя из Supabase:",
          selectError.message
        );
        throw new Error(selectError.message); // Прерываем выполнение при критической ошибке
      }

      if (!existingUser) {
        // Получаем данные пользователя из Clerk
        const user = await clerkClient.users.getUser(userId);

        // Логируем данные пользователя
        console.log("User data from Clerk:", user);

        // Добавляем пользователя в таблицу User
        const { error: insertError } = await supabase.from("User").insert({
          id: userId,
          email: user.emailAddresses[0].emailAddress,
          name: user.firstName
            ? `${user.firstName} ${user.lastName}`
            : user.username || user.emailAddresses[0].emailAddress,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        if (insertError) {
          console.error(
            "Ошибка при добавлении пользователя в Supabase:",
            insertError.message
          );
        } else {
          console.log("Пользователь успешно добавлен в Supabase.");
        }
      } else {
        console.log("Пользователь уже существует в базе данных.");
      }
    } catch (error) {
      console.error("Общая ошибка при обработке пользователя:", error);
    }
  }

  // Проверка защищенных маршрутов
  if (isProtectedRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
