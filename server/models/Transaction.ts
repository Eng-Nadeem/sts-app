import { Schema, model, Types, Document } from "mongoose";

export interface ITransaction extends Document {
	user: Types.ObjectId;
	meter: Types.ObjectId;
	amount: number;
	paymentMethod: "visa" | "wallet";
	tokenCode?: string;
	status: "pending" | "success" | "failed";
	transactionType: "recharge" | "debt_payment";
	externalReference?: string;
}

const TransactionSchema = new Schema<ITransaction>(
	{
		user: { type: Schema.Types.ObjectId, ref: "User", required: true },
		meter: { type: Schema.Types.ObjectId, ref: "Meter", required: true },
		amount: { type: Number, required: true },
		paymentMethod: {
			type: String,
			enum: ["visa", "wallet"],
			required: true,
		},
		tokenCode: { type: String },
		status: {
			type: String,
			enum: ["pending", "success", "failed"],
			default: "pending",
		},
		transactionType: {
			type: String,
			enum: ["recharge", "debt_payment"],
			required: true,
		},
		externalReference: { type: String },
	},
	{ timestamps: true }
);

export default model<ITransaction>("Transaction", TransactionSchema);
