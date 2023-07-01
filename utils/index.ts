import { getAddress } from "ethers/lib/utils";
import { getProfileModel } from "./mongo_profile";
import blackProfileList from "./blacklist.json";

export const NETWORK = process.env.NETWORK ?? "mainnet";
export const CONTENT_DELIVERY_NETWORK_URI = process.env.CONTENT_DELIVERY_NETWORK_URI ?? "https://nfthost.b8dex.com";
export const PROFILE_SUBGRAPH = "https://api.thegraph.com/subgraphs/name/zemtsovigor/profile";

export const getTokenURI = (tokenURI: string): string => {
  if (tokenURI && tokenURI.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${tokenURI.split("ipfs://").join("").trim()}`;
  }

  return tokenURI.trim();
};

export const getCDN = (address: string, type: "avatar" | "banner-lg" | "banner-sm"): string => {
  switch (type) {
    case "avatar":
      return `${CONTENT_DELIVERY_NETWORK_URI}/${NETWORK}/${getAddress(address)}/avatar.png`;
    case "banner-lg":
      return `${CONTENT_DELIVERY_NETWORK_URI}/${NETWORK}/${getAddress(address)}/banner-lg.png`;
    case "banner-sm":
      return `${CONTENT_DELIVERY_NETWORK_URI}/${NETWORK}/${getAddress(address)}/banner-sm.png`;
    default:
      return `${CONTENT_DELIVERY_NETWORK_URI}/${NETWORK}/unknown.png`;
  }
};

/**
 * Check for the validity of a username based on rules (see documentation).
 *
 *
 * @param {string} username
 * @returns {Promise<{ valid: boolean; message?: string }>}
 */
export const isValid = async (username: string): Promise<{ valid: boolean; message?: string }> => {
  // Check if the username is set to avoid unhandled rejection.
  if (!username) {
    return {
      valid: false,
      message: "Minimum length: 3 characters",
    };
  }

  // Cannot use a username of less than 3 characters
  if (username.length < 3) {
    return {
      valid: false,
      message: "Minimum length: 3 characters",
    };
  }

  // Cannot use a username of more than 15 characters
  if (username.length > 15) {
    return {
      valid: false,
      message: "Maximum length: 15 characters",
    };
  }

  // Can only use alphanumeric characters
  // Cannot use a space in their username
  if (!username.match(/^[a-zA-Z0-9]+$/i)) {
    return {
      valid: false,
      message: "No spaces or special characters",
    };
  }

  // Cannot create a username which violates blacklist
  if (username.toLowerCase().match(blackProfileList.join("|"))) {
    return {
      valid: false,
      message: "Username not allowed",
    };
  }

  // Cannot have the same username as another user (Case insensitive)
  const userModel = await getProfileModel("User");
  if (await userModel.exists({ slug: username.toLowerCase() })) {
    return {
      valid: false,
      message: "Username taken",
    };
  }

  return {
    valid: true,
  };
};
