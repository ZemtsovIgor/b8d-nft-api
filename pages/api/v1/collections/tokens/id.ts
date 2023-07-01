import { Contract } from "@ethersproject/contracts";
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAddress, isAddress } from "ethers/lib/utils";
import { Attribute, Collection, Token } from "../../../../../utils/types";
import { getModel } from "../../../../../utils/mongo";
import { CONTENT_DELIVERY_NETWORK_URI, getTokenURI, NETWORK } from "../../../../../utils";
import { paramCase } from "param-case";
import axios from "axios";
import provider from "../../../../../utils/provider";
import ercABI from "../../../../../utils/abis/ERC721.json";

export default async (req: NextApiRequest, res: NextApiResponse): Promise<NextApiResponse | void> => {
  if (req.method?.toUpperCase() === "OPTIONS") {
    return res.status(204).end();
  }

  let { address, id } = req.query;
  address = address as string;
  id = id as string;

  // Sanity check for address; to avoid any SQL-like injections, ...
  if (address && isAddress(address) && id) {
    try {
      const collectionModel = await getModel("Collection");
      const collection: Collection = await collectionModel.findOne({ address: address.toLowerCase() }).exec();
      if (!collection) {
        return res.status(404).json({ error: { message: "Entity not found." } });
      }

      const tokenModel = await getModel("Token");
      const token: Token = await tokenModel
        .findOne({ parent_collection: collection, token_id: id.toLowerCase() })
        .populate(["parent_collection", "metadata", "attributes"])
        .exec();
      if (!token) {
        const contract = new Contract(collection.address, ercABI, provider);
        const tokenURI = await contract.tokenURI(id);
        console.log('collection', collection);
        console.log('token_id', id);
        console.log('tokenURI', tokenURI);

        const response = await axios(getTokenURI(tokenURI));
        console.log('response', response);
        const data = {
          tokenId: id,
          name: response.data.name,
          description: response.data.description,
          image: {
            original: getTokenURI(response.data.image),
            thumbnail: getTokenURI(response.data.image),
            mp4: response.data.mp4_url
              ? `${CONTENT_DELIVERY_NETWORK_URI}/${NETWORK}/${getAddress(collection.address)}/${paramCase(
                  response.data.name
                )}.mp4`
              : null,
            webm: response.data.webm_url
              ? `${CONTENT_DELIVERY_NETWORK_URI}/${NETWORK}/${getAddress(collection.address)}/${paramCase(
                  response.data.name
                )}.webm`
              : null,
            gif: response.data.gif_url
              ? `${CONTENT_DELIVERY_NETWORK_URI}/${NETWORK}/${getAddress(collection.address)}/${paramCase(
                  response.data.name
                )}.gif`
              : null,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          attributes: response.data.attributes
            ? Object.keys(response.data.attributes).map((attribute: any) => ({
                traitType: attribute,
                value: response.data.attributes[attribute],
                displayType: null,
              }))
            : [],
          collection: {
            name: collection.name,
          },
        };

        return res.status(200).json({ data });
      } else {
        const data = {
          tokenId: id,
          name: token.metadata.name,
          description: token.metadata.description,
          image: {
            original: `${CONTENT_DELIVERY_NETWORK_URI}/${NETWORK}/${getAddress(collection.address)}/${paramCase(
              token.metadata.name
            )}.png`,
            thumbnail: `${CONTENT_DELIVERY_NETWORK_URI}/${NETWORK}/${getAddress(collection.address)}/${paramCase(
              token.metadata.name
            )}-1000.png`,
            mp4: token.metadata.mp4
              ? `${CONTENT_DELIVERY_NETWORK_URI}/${NETWORK}/${getAddress(collection.address)}/${paramCase(
                  token.metadata.name
                )}.mp4`
              : null,
            webm: token.metadata.webm
              ? `${CONTENT_DELIVERY_NETWORK_URI}/${NETWORK}/${getAddress(collection.address)}/${paramCase(
                  token.metadata.name
                )}.webm`
              : null,
            gif: token.metadata.gif
              ? `${CONTENT_DELIVERY_NETWORK_URI}/${NETWORK}/${getAddress(collection.address)}/${paramCase(
                  token.metadata.name
                )}.gif`
              : null,
          },
          createdAt: token.created_at,
          updatedAt: token.updated_at,
          attributes: token.attributes
            ? token.attributes.map((attribute: Attribute) => ({
                traitType: attribute.trait_type,
                value: attribute.value,
                displayType: attribute.display_type,
              }))
            : [],
          collection: {
            name: token.parent_collection.name,
          },
        };

        return res.status(200).json({ data });
      }
    } catch (error) {
      console.log({ error });
      return res.status(500).json({ error: { message: "Unknown error." } });
    }
  }

  return res.status(400).json({ error: { message: "Invalid address." } });
};
