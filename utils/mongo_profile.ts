import mongoose, { Connection, Model } from "mongoose";
import { userSchema } from "./schemas/profile.schema";

let connection: Connection | null = null;

/**
 * @see https://vercel.com/guides/deploying-a-mongodb-powered-api-with-node-and-vercel
 * @see https://mongoosejs.com/docs/lambda.html
 */
export const getProfileConnection = async (): Promise<Connection> => {
  if (connection === null) {
    /* istanbul ignore next */
    const uri = process.env.MONGO_PROFILE_URI ?? "mongodb://localhost:27017/profile";
    connection = mongoose.createConnection(uri);

    await connection;
    connection.model("User", userSchema);
  }

  return connection;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getProfileModel = async (name: string): Promise<Model<any>> => {
  connection = await getProfileConnection();

  return connection.model(name);
};
