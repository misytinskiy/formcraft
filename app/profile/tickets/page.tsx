"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Header from "@/components/Header";

export default function TicketsPage() {
  const { user } = useUser();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("Ticket")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching tickets:", error);
        } else {
          setTickets(data || []);
        }

        setLoading(false);
      }
    };

    const updateTickets = async () => {
      await fetch("/api/jira/update-tickets", {
        method: "POST",
      });
      await fetchTickets();
    };

    updateTickets();
  }, [user]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Header />

      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-2xl font-semibold mb-4">My Tickets</h1>
        {tickets.length > 0 ? (
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="px-6 py-3 border-b text-left">Ticket</th>
                <th className="px-6 py-3 border-b text-left">Summary</th>
                <th className="px-6 py-3 border-b text-left">Priority</th>
                <th className="px-6 py-3 border-b text-left">Status</th>
                <th className="px-6 py-3 border-b text-left">Created At</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td className="px-6 py-4 border-b">
                    <Link
                      href={`${process.env.NEXT_PUBLIC_JIRA_BASE_URL}/browse/${ticket.issue_key}`}
                      target="_blank"
                      className="text-blue-600 hover:underline"
                    >
                      {ticket.issue_key}
                    </Link>
                  </td>
                  <td className="px-6 py-4 border-b">{ticket.summary}</td>
                  <td className="px-6 py-4 border-b">{ticket.priority}</td>
                  <td className="px-6 py-4 border-b">{ticket.status}</td>
                  <td className="px-6 py-4 border-b">
                    {new Date(ticket.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>You have no tickets yet.</p>
        )}
      </div>
    </>
  );
}
