"use client";

import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUserContext } from "@/context/UserContext";
import { Check, X, Trash2, Shield, Ban } from "lucide-react";
import { toast } from "sonner";

export default function ManageUsersPage() {
  const { userId } = useUserContext();
  const [users, setUsers] = useState<any[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const fetchUsers = useCallback(async () => {
    const { data, error } = await supabase
      .from("User")
      .select("*")
      .order("email", { ascending: sortOrder === "asc" });

    if (error) {
      console.error("Error getting list of users:", error);
    } else {
      setUsers(data);
    }
  }, [sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [sortOrder, fetchUsers]);

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };

  const updateUserRole = async (targetUserId: string, newRole: string) => {
    if (targetUserId === userId && newRole !== "ADMIN") {
      toast.error("You cannot remove administrator rights from yourself.");
      return;
    }

    const { error } = await supabase
      .from("User")
      .update({ role: newRole })
      .eq("id", targetUserId);

    if (error) {
      toast.error("Error updating user role");
    } else {
      toast.success("User role updated");
      fetchUsers();
    }
  };

  const updateUserStatus = async (targetUserId: string, newStatus: string) => {
    if (targetUserId === userId) {
      toast.error("You cannot change your own status.");
      return;
    }

    const { error } = await supabase
      .from("User")
      .update({ status: newStatus })
      .eq("id", targetUserId);

    if (error) {
      toast.error("Error updating user status");
    } else {
      toast.success("User status updated");
      fetchUsers();
    }
  };

  const deleteUser = async (targetUserId: string) => {
    if (targetUserId === userId) {
      toast.error("You cannot delete your own account.");
      return;
    }

    const { error } = await supabase
      .from("User")
      .delete()
      .eq("id", targetUserId);

    if (error) {
      toast.error("Error deleting user");
    } else {
      toast.success("User deleted");
      fetchUsers();
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      <table className="min-w-full bg-white border rounded shadow-md">
        <thead>
          <tr>
            <th
              className="py-2 px-4 border-b cursor-pointer"
              onClick={toggleSortOrder}
            >
              Email
            </th>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Role</th>
            <th className="py-2 px-4 border-b">Status</th>
            <th className="py-2 px-4 border-b">Actions</th>
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
