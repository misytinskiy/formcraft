import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";
import JiraClient from "jira-client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Метод не поддерживается" });
  }

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

    res.status(200).json({ message: "Статусы тикетов обновлены" });
  } catch (error: any) {
    console.error("Ошибка при обновлении статусов тикетов:", error);
    res.status(500).json({ error: "Ошибка при обновлении статусов" });
  }
}
