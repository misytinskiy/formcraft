"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabaseClient";

interface UserContextType {
  userId: string | null;
  role: string | null;
}

const UserContext = createContext<UserContextType>({
  userId: null,
  role: null,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("User")
          .select("role")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Ошибка при получении роли пользователя:", error);
        } else {
          setRole(data.role);
        }
      }
    };

    fetchUserRole();
  }, [user]);

  return (
    <UserContext.Provider value={{ userId: user?.id || null, role }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  console.log("Context inside useUserContext:", context); // Отладочный лог
  if (!context) {
    console.error("useUserContext должен использоваться внутри UserProvider");
  }
  return context;
};
