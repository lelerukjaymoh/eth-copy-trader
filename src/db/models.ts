import { Schema, model } from "mongoose";
import { tokenInterface } from "../types";

const TokenSchema = new Schema<tokenInterface>(
  {
    tokenAddress: { type: String, required: true },
    bought: { type: Boolean, required: true, default: false },
    txHash: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

const BoughtTokens = model<tokenInterface>("Tokens", TokenSchema, "Tokens");

export { BoughtTokens };
