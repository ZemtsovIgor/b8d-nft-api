import type { NextApiRequest, NextApiResponse } from 'next';
import { getAddress, isAddress } from "ethers/lib/utils";
import { getProfileModel } from "../../../../utils/mongo_profile";

export default async (req: NextApiRequest, res: NextApiResponse): Promise<NextApiResponse | void> => {
  if (req.method?.toUpperCase() === "OPTIONS") {
    return res.status(204).end();
  }

  let { address } = req.query;
  address = address as string;

  // Sanity check for address; to avoid any SQL-like injections, ...
  if (address && isAddress(address)) {
    const userModel = await getProfileModel("User");
    const user = await userModel.findOne({ address: address.toLowerCase() }).exec();
    if (!user) {
      return res.status(404).json({ error: { message: "Entity not found." } });
    }

    return res.status(200).json({
      ...{
        address: getAddress(user.address),
        username: user.username,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  }

  return res.status(400).json({ error: { message: "Invalid address." } });
};
