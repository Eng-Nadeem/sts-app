import { Schema, model, Types, Document } from "mongoose";

export interface IDebt extends Document {
	meter: Types.ObjectId;
	amountDue: number;
	dueDate?: Date;
	isPaid: boolean;
	paidAt?: Date;
}

const DebtSchema = new Schema<IDebt>(
	{
		meter: { type: Schema.Types.ObjectId, ref: "Meter", required: true },
		amountDue: { type: Number, required: true },
		dueDate: { type: Date },
		isPaid: { type: Boolean, default: false },
		paidAt: { type: Date },
	},
	{ timestamps: true }
);

export default model<IDebt>("Debt", DebtSchema);
