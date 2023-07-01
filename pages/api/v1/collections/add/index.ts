import type { NextApiRequest, NextApiResponse } from 'next';
import { Wallet } from "ethers";
import { isAddress } from "ethers/lib/utils";
import { Collection } from "../../../../../utils/types";
import { getModel } from "../../../../../utils/mongo";
import { Contract } from "@ethersproject/contracts";
import { BigNumber } from "@ethersproject/bignumber";
import ercABI from "../../../../../utils/abis/ERC721.json";
import marketABI from "../../../../../utils/abis/B8DMarketplace.json";
import provider from "../../../../../utils/provider";

const fetchCollectionInfo = async (address: string, owner: string, description: string) => {
  const contract = new Contract(address, ercABI, provider);

  const totalSupplyBig: BigNumber = await contract.totalSupply();
  const name: BigNumber = await contract.name();
  const symbol: BigNumber = await contract.symbol();

  const collectionInfo = {
    address,
    owner,
    name,
    description: description ?? name,
    symbol,
    total_supply: totalSupplyBig.toNumber(),
    visible: true,
    verified: true,
    created_at: new Date(),
    updated_at: new Date()
  }

  return { collectionInfo };
};

const addCollectionToMarket = async (address: string) => {
  const privateKey = process.env.OPERATOR_PRIVATE_KEY ?? '';
  const operator = new Wallet(privateKey, provider);
  const marketAddr = process.env.MARKET ?? '';

  const contract = new Contract(marketAddr, marketABI, operator);

  const [_gasPrice]: [BigNumber] = await Promise.all([
    provider.getGasPrice(),
  ]);

  const tx = await contract.addCollection(
    address,
    '0x0000000000000000000000000000000000000000',
    '0x0000000000000000000000000000000000000000',
    200,
    0,
    { from: operator.address, gasLimit: 500000, gasPrice: _gasPrice.mul(2) }
  );

  console.log(tx);

  return { tx };
};

export default async (req: NextApiRequest, res: NextApiResponse): Promise<NextApiResponse | void> => {
  if (req.method?.toUpperCase() === "OPTIONS") {
    return res.status(204).end();
  }

  const address = req.query.address as string;
  const owner = req.query.owner as string;
  const new_owner: string = owner ?? process.env.DEFAULT_OWNER;
  const description: string = req.query.description as string;

  // Sanity check for address; to avoid any SQL-like injections, ...
  if (address && isAddress(address)) {
    const collectionModel = await getModel("Collection");
    const collection: Collection = await collectionModel.findOne({ address: address.toLowerCase() }).exec();

    if (collection) {
      return res.status(404).json({ error: { message: "Collection already exist." } });
    }

    const { collectionInfo } = await fetchCollectionInfo(address.toLowerCase(), new_owner.toLowerCase(), description);

    const { tx } = await addCollectionToMarket(address.toLowerCase());

    const new_collection = await new collectionModel(collectionInfo).save();

    return res.status(200).json(new_collection);

  }

  return res.status(400).json({ error: { message: "Invalid address." } });
};
