import { supabase } from "./supabaseClient";

export async function getSalesforceTokens(userId: string) {
  const { data, error } = await supabase
    .from("salesforce_tokens")
    .select("access_token, refresh_token, instance_url")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return { accessToken: null, refreshToken: null, instanceUrl: null };
  }

  return {
    accessToken: data.access_token as string,
    refreshToken: data.refresh_token as string,
    instanceUrl: data.instance_url as string,
  };
}

export async function saveSalesforceTokens(
  userId: string,
  accessToken: string,
  refreshToken: string,
  instanceUrl: string
) {
  const { error } = await supabase.from("salesforce_tokens").upsert(
    {
      user_id: userId,
      access_token: accessToken,
      refresh_token: refreshToken,
      instance_url: instanceUrl,
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("Ошибка при сохранении токенов Salesforce:", error);
  }
}
