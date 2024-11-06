import { NextApiRequest, NextApiResponse } from "next";
import { updateUser } from "@/lib/data";
import { v4 as uuidv4 } from "uuid";
import { getAuth } from "@clerk/nextjs/server";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const apiToken = uuidv4();

  await updateUser(userId, { apiToken });

  return res.status(200).json({ apiToken });
}
