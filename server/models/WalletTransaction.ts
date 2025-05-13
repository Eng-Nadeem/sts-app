import { Schema, model, Types, Document } from "mongoose";

export interface IWalletTransaction extends Document {
	user: Types.ObjectId;
	type: "top_up" | "deduction";
	amount: number;
	description?: string;
}

const WalletTransactionSchema = new Schema<IWalletTransaction>(
	{
		user: { type: Schema.Types.ObjectId, ref: "User", required: true },
		type: { type: String, enum: ["top_up", "deduction"], required: true },
		amount: { type: Number, required: true },
		description: { type: String },
	},
	{ timestamps: true }
);

export default model<IWalletTransaction>(
	"WalletTransaction",
	WalletTransactionSchema
);
