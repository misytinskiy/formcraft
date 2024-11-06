import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import jsforce from "jsforce";
import { saveSalesforceTokens } from "@/lib/salesforceTokens";

const callbackHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.redirect("/sign-in");
    return;
  }

  const oauth2 = new jsforce.OAuth2({
    loginUrl: "https://login.salesforce.com",
    clientId: process.env.SF_CLIENT_ID!,
    clientSecret: process.env.SF_CLIENT_SECRET!,
    redirectUri: process.env.SF_CALLBACK_URL!,
  });

  const conn = new jsforce.Connection({ oauth2 });

  const code = req.query.code as string;

  try {
    await conn.authorize(code);

    await saveSalesforceTokens(
      userId,
      conn.accessToken!,
      conn.refreshToken!,
      conn.instanceUrl!
    );

    res.redirect("/salesforce/form");
  } catch (err) {
    console.error("Salesforce OAuth Error:", err);
    res.redirect("/error");
  }
};

export default callbackHandler;
