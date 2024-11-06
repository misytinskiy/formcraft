import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import jsforce from "jsforce";

const authorizeHandler = async (req: NextApiRequest, res: NextApiResponse) => {
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

  res.redirect(oauth2.getAuthorizationUrl({}));
};

export default authorizeHandler;
