import { NextRequest, NextResponse } from "next/server";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import JiraClient from "jira-client";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request: NextRequest) {
  const { userId } = getAuth(request);

  if (!userId) {
    return NextResponse.json(
      { error: "You need to be logged in" },
      { status: 401 }
    );
  }

  const { summary, priority, pageUrl } = await request.json();

  // Create Jira client
  const jira = new JiraClient({
    protocol: "https",
    host: process.env.JIRA_BASE_URL!.replace("https://", ""),
    username: process.env.JIRA_EMAIL!,
    password: process.env.JIRA_API_TOKEN!,
    apiVersion: "2",
    strictSSL: true,
  });

  try {
    // Get user information
    const userData = await clerkClient().users.getUser(userId);

    const email = userData.emailAddresses[0].emailAddress;
    const displayName = `${userData.firstName || ""} ${
      userData.lastName || ""
    }`.trim();

    // Create issue data
    const issueData: any = {
      fields: {
        project: {
          key: process.env.JIRA_PROJECT_KEY,
        },
        summary: summary,
        description: `Created from page: ${pageUrl}\nUser: ${displayName} (${email})`,
        issuetype: {
          name: "Task",
        },
        labels: ["support_ticket"],
      },
    };

    // Include 'priority' if provided
    if (priority) {
      issueData.fields.priority = {
        id: priority,
      };
    }

    // Create the issue
    const issue = await jira.addNewIssue(issueData);

    // Fetch full issue details
    const fullIssue = await jira.findIssue(issue.key);

    // Get the status name
    const statusName = fullIssue.fields.status.name;

    const ticketUrl = `${process.env.JIRA_BASE_URL}/browse/${issue.key}`;

    // Save ticket information to the database
    const { error: dbError } = await supabase.from("Ticket").insert({
      id: issue.id,
      user_id: userId,
      issue_key: issue.key,
      summary,
      priority,
      status: statusName,
    });

    if (dbError) {
      console.error("Error saving ticket to the database:", dbError);
    }

    return NextResponse.json({ ticketUrl });
  } catch (error: any) {
    console.error("Error creating ticket in Jira:", error);
    return NextResponse.json(
      { error: "Error creating ticket" },
      { status: 500 }
    );
  }
}
