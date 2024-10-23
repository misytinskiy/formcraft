import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    // Защищаем маршрут: перенаправляем неаутентифицированных пользователей на страницу входа
    auth().protect();
  }
  // Остальные маршруты остаются публичными
});

export const config = {
  matcher: [
    // Исключаем внутренние файлы Next.js и статические ресурсы
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Применяем к API маршрутам
    "/(api|trpc)(.*)",
  ],
};
