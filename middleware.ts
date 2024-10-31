import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabaseClient";
import { clerkClient } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = auth();

  if (userId) {
    try {
      const { data: user, error: selectError } = await supabase
        .from("User")
        .select("role, status")
        .eq("id", userId)
        .single();

      if (selectError && selectError.code !== "PGRST116") {
        console.error(
          "Ошибка при выборке пользователя из Supabase:",
          selectError.message
        );
        throw new Error(selectError.message);
      }

      if (!user) {
        const clerkUser = await clerkClient.users.getUser(userId);

        const { error: insertError } = await supabase.from("User").insert({
          id: userId,
          email: clerkUser.emailAddresses[0].emailAddress,
          name: clerkUser.firstName
            ? `${clerkUser.firstName} ${clerkUser.lastName}`
            : clerkUser.username || clerkUser.emailAddresses[0].emailAddress,
          role: "USER",
          status: "ACTIVE", // По умолчанию пользователь активен
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
        // Проверка роли пользователя для маршрутов /admin
        const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
        if (isAdminRoute && user.role !== "ADMIN") {
          return NextResponse.redirect(`${req.nextUrl.origin}/`); // Перенаправляем неадминистратора на главную
        }

        // Проверка статуса пользователя
        if (user.status === "BLOCKED") {
          if (req.nextUrl.pathname !== "/blocked") {
            // Если пользователь не на странице /blocked, перенаправляем его
            return NextResponse.redirect(`${req.nextUrl.origin}/blocked`);
          }
          // Если пользователь уже на странице /blocked, разрешаем доступ
          return NextResponse.next();
        }
      }
    } catch (error) {
      console.error("Общая ошибка при обработке пользователя:", error);
      return NextResponse.redirect(`${req.nextUrl.origin}/error`);
    }
  }

  // Проверка защищенных маршрутов
  if (isProtectedRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
