import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import jsforce from "jsforce";
import {
  getSalesforceTokens,
  saveSalesforceTokens,
} from "@/lib/salesforceTokens";

const createHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log("Received request to /api/salesforce/create");
  const { userId } = getAuth(req);
  console.log("User ID:", userId);

  if (!userId) {
    console.error("User not authenticated");
    res.status(401).json({ error: "Необходимо авторизоваться" });
    return;
  }

  const { accessToken, refreshToken, instanceUrl } = await getSalesforceTokens(
    userId
  );

  console.log("Retrieved Salesforce tokens:", {
    accessToken: accessToken ? "exists" : "not found",
    refreshToken: refreshToken ? "exists" : "not found",
    instanceUrl,
  });

  if (!accessToken || !refreshToken || !instanceUrl) {
    console.error("Missing Salesforce tokens");
    res.status(400).json({
      error: "Salesforce токены не найдены. Пожалуйста, авторизуйтесь.",
    });
    return;
  }

  const oauth2 = new jsforce.OAuth2({
    loginUrl: "https://login.salesforce.com",
    clientId: process.env.SF_CLIENT_ID!,
    clientSecret: process.env.SF_CLIENT_SECRET!,
    redirectUri: process.env.SF_CALLBACK_URL!,
  });

  const conn = new jsforce.Connection({
    oauth2,
    accessToken: accessToken,
    refreshToken: refreshToken,
    instanceUrl: instanceUrl,
    version: "57.0",
  });

  conn.on("refresh", function (newAccessToken: string) {
    console.log("Access token refreshed");
    saveSalesforceTokens(userId, newAccessToken, refreshToken, instanceUrl);
  });

  try {
    const { accountData, contactData } = req.body;
    console.log("Account data to be created:", accountData);

    // Проверяем соединение перед вызовом create
    await conn.identity();
    console.log("Connection to Salesforce is valid.");

    // Создайте Account
    const accountResults = await conn.sobject("Account").create(accountData);
    console.log("Raw accountResults:", accountResults);

    const accountResult = Array.isArray(accountResults)
      ? accountResults[0]
      : accountResults;
    console.log("Account creation result:", accountResult);

    if (!accountResult || !accountResult.success) {
      console.error("Error creating Account:", accountResult?.errors);
      res.status(500).json({
        error: "Ошибка при создании Account",
        details: accountResult?.errors || "Неизвестная ошибка",
      });
      return;
    }

    // Свяжите Contact с созданным Account
    contactData.AccountId = accountResult.id;
    console.log("Contact data to be created:", contactData);

    // Создайте Contact
    const contactResults = await conn.sobject("Contact").create(contactData);
    console.log("Raw contactResults:", contactResults);

    const contactResult = Array.isArray(contactResults)
      ? contactResults[0]
      : contactResults;
    console.log("Contact creation result:", contactResult);

    if (!contactResult || !contactResult.success) {
      console.error("Error creating Contact:", contactResult?.errors);
      res.status(500).json({
        error: "Ошибка при создании Contact",
        details: contactResult?.errors || "Неизвестная ошибка",
      });
      return;
    }

    res.status(200).json({ message: "Успешно создано" });
  } catch (error: any) {
    console.error("Salesforce API Error:", error);
    res.status(500).json({
      error: "Ошибка при взаимодействии с Salesforce",
      details: error.message,
    });
  }
};

export default createHandler;
