import { SignOutButton } from "@clerk/nextjs";

export default function BlockedPage() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Ваш аккаунт заблокирован</h1>
        <p className="mt-4">
          Пожалуйста, свяжитесь с администратором для получения дополнительной
          информации.
        </p>
        <div className="mt-6">
          <SignOutButton>
            <button className="bg-red-500 text-white px-4 py-2 rounded">
              Выйти из системы
            </button>
          </SignOutButton>
        </div>
      </div>
    </div>
  );
}
