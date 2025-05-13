import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { generateToken } from "../utils/generateToken";

export const register = async (req: Request, res: Response): Promise<void> => {
	const { name, email, password } = req.body;
	const userExists = await User.findOne({ email });
	if (userExists) {
		res.status(400).json({ message: "User already exists" });
		return;
	}
	const hashed = await bcrypt.hash(password, 10);
	const user = await User.create({ name, email, password: hashed });
	res.status(201).json({ token: generateToken(user._id.toString()) });
};

export const login = async (req: Request, res: Response): Promise<void> => {
	const { email, password } = req.body;
	const user = await User.findOne({ email });
	if (user && (await bcrypt.compare(password, user.password))) {
		res.json({ token: generateToken(user._id.toString()) });
	} else {
		res.status(401).json({ message: "Invalid credentials" });
	}
};
