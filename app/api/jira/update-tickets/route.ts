import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import JiraClient from "jira-client";

// Обработка POST-запроса
export async function POST() {
  // Создание клиента Jira
  const jira = new JiraClient({
    protocol: "https",
    host: process.env.JIRA_BASE_URL!.replace("https://", ""),
    username: process.env.JIRA_EMAIL!,
    password: process.env.JIRA_API_TOKEN!,
    apiVersion: "2",
    strictSSL: true,
  });

  try {
    // Получаем все тикеты из базы данных
    const { data: tickets, error } = await supabase.from("Ticket").select("*");

    if (error) {
      throw error;
    }

    // Обновляем статус каждого тикета
    for (const ticket of tickets) {
      const issue = await jira.findIssue(ticket.issue_key);
      const status = issue.fields.status.name;

      await supabase.from("Ticket").update({ status }).eq("id", ticket.id);
    }

    return NextResponse.json({ message: "Статусы тикетов обновлены" });
  } catch (error: any) {
    console.error("Ошибка при обновлении статусов тикетов:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении статусов" },
      { status: 500 }
    );
  }
}
