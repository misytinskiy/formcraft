"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUserContext } from "@/context/UserContext";
import { Check, X, Trash2, Shield, Ban } from "lucide-react";
import { toast } from "sonner";

export default function ManageUsersPage() {
  const { userId } = useUserContext();
  const [users, setUsers] = useState<any[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    fetchUsers();
  }, [sortOrder]);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("User")
      .select("*")
      .order("email", { ascending: sortOrder === "asc" });

    if (error) {
      console.error("Ошибка при получении списка пользователей:", error);
    } else {
      setUsers(data);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };

  const updateUserRole = async (targetUserId: string, newRole: string) => {
    if (targetUserId === userId && newRole !== "ADMIN") {
      toast.error("Вы не можете снять права администратора у самого себя.");
      return;
    }

    const { error } = await supabase
      .from("User")
      .update({ role: newRole })
      .eq("id", targetUserId);

    if (error) {
      toast.error("Ошибка при обновлении роли пользователя");
    } else {
      toast.success("Роль пользователя обновлена");
      fetchUsers();
    }
  };

  const updateUserStatus = async (targetUserId: string, newStatus: string) => {
    if (targetUserId === userId) {
      toast.error("Вы не можете изменить свой собственный статус.");
      return;
    }

    const { error } = await supabase
      .from("User")
      .update({ status: newStatus })
      .eq("id", targetUserId);

    if (error) {
      toast.error("Ошибка при обновлении статуса пользователя");
    } else {
      toast.success("Статус пользователя обновлен");
      fetchUsers();
    }
  };

  const deleteUser = async (targetUserId: string) => {
    if (targetUserId === userId) {
      toast.error("Вы не можете удалить свой собственный аккаунт.");
      return;
    }

    const { error } = await supabase
      .from("User")
      .delete()
      .eq("id", targetUserId);

    if (error) {
      toast.error("Ошибка при удалении пользователя");
    } else {
      toast.success("Пользователь удален");
      fetchUsers();
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Управление пользователями</h2>
      <table className="min-w-full bg-white border rounded shadow-md">
        <thead>
          <tr>
            <th
              className="py-2 px-4 border-b cursor-pointer"
              onClick={toggleSortOrder}
            >
              Email
            </th>
            <th className="py-2 px-4 border-b">Имя</th>
            <th className="py-2 px-4 border-b">Роль</th>
            <th className="py-2 px-4 border-b">Статус</th>
            <th className="py-2 px-4 border-b">Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="py-2 px-4 border-b">{user.email}</td>
              <td className="py-2 px-4 border-b">{user.name}</td>
              <td className="py-2 px-4 border-b">{user.role}</td>
              <td className="py-2 px-4 border-b">{user.status}</td>
              <td className="py-2 px-4 border-b flex space-x-2">
                {user.role !== "ADMIN" && (
                  <button onClick={() => updateUserRole(user.id, "ADMIN")}>
                    <Shield className="text-blue-500 hover:text-blue-700" />
                  </button>
                )}
                {user.role === "ADMIN" && user.id !== userId && (
                  <button onClick={() => updateUserRole(user.id, "USER")}>
                    <X className="text-yellow-500 hover:text-yellow-700" />
                  </button>
                )}
                {user.status === "ACTIVE" && user.id !== userId && (
                  <button onClick={() => updateUserStatus(user.id, "BLOCKED")}>
                    <Ban className="text-red-500 hover:text-red-700" />
                  </button>
                )}
                {user.status === "BLOCKED" && (
                  <button onClick={() => updateUserStatus(user.id, "ACTIVE")}>
                    <Check className="text-green-500 hover:text-green-700" />
                  </button>
                )}
                {user.id !== userId && (
                  <button onClick={() => deleteUser(user.id)}>
                    <Trash2 className="text-gray-500 hover:text-gray-700" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
