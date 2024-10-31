// app/admin/page.tsx
import Link from "next/link";

export default function AdminHomePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Админ-панель</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/admin/users" className="block p-4 bg-white shadow rounded">
          <h2 className="text-xl font-bold">Управление пользователями</h2>
          <p className="text-gray-600">Просмотр и управление пользователями</p>
        </Link>
        <Link href="/admin/forms" className="block p-4 bg-white shadow rounded">
          <h2 className="text-xl font-bold">Управление формами</h2>
          <p className="text-gray-600">Просмотр и управление всеми формами</p>
        </Link>
        <Link
          href="/admin/responses"
          className="block p-4 bg-white shadow rounded"
        >
          <h2 className="text-xl font-bold">Управление ответами</h2>
          <p className="text-gray-600">
            Просмотр и редактирование ответов пользователей
          </p>
        </Link>
      </div>
    </div>
  );
}
