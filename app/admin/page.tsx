import Link from "next/link";

export default function AdminHomePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Admin Panel</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/admin/users" className="block p-4 bg-white shadow rounded">
          <h2 className="text-xl font-bold">User Management</h2>
          <p className="text-gray-600">View and manage users</p>
        </Link>
        <Link href="/admin/forms" className="block p-4 bg-white shadow rounded">
          <h2 className="text-xl font-bold">Form Management</h2>
          <p className="text-gray-600">View and manage all forms</p>
        </Link>
        <Link
          href="/admin/responses"
          className="block p-4 bg-white shadow rounded"
        >
          <h2 className="text-xl font-bold">Response Management</h2>
          <p className="text-gray-600">View and edit user responses</p>
        </Link>
      </div>
    </div>
  );
}
