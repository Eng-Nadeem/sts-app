import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
	name: string;
	email: string;
	password: string;
	walletBalance: number;
}

const UserSchema = new Schema<IUser>(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		walletBalance: { type: Number, default: 0 },
	},
	{ timestamps: true }
);

export default model<IUser>("User", UserSchema);
