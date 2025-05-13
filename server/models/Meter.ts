import { Schema, model, Types, Document } from "mongoose";

export interface IMeter extends Document {
	user: Types.ObjectId;
	meterNumber: string;
	alias?: string;
}

const MeterSchema = new Schema<IMeter>(
	{
		user: { type: Schema.Types.ObjectId, ref: "User", required: true },
		meterNumber: { type: String, required: true, unique: true },
		alias: { type: String },
	},
	{ timestamps: true }
);

export default model<IMeter>("Meter", MeterSchema);
