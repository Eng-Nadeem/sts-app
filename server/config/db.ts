import * as dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const connectDB = async (): Promise<void> => {
	try {
		const uri =
			"mongodb+srv://waseemikhlaif:Aa%4011%4011@reactstsapp.tjxwjtq.mongodb.net/prepaid-meter?retryWrites=true&w=majority&appName=ReactStsApp";
		if (!uri) throw new Error("MONGO_URI is not defined");
		await mongoose.connect(uri);
		console.log("MongoDB connected");
	} catch (err) {
		console.error("MongoDB connection error:", err);
		process.exit(1);
	}
};

export default connectDB;
