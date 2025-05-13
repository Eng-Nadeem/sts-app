import { Request, Response } from "express";
import WalletTransaction from "../models/WalletTransaction";
import User from "../models/User";

export const topUp = async (req: any, res: Response): Promise<void> => {
	const { amount } = req.body;
	await WalletTransaction.create({
		user: req.user._id,
		type: "top_up",
		amount,
	});
	const user = await User.findByIdAndUpdate(
		req.user._id,
		{ $inc: { walletBalance: amount } },
		{ new: true }
	);
	res.json(user);
};

export const getWallet = async (req: any, res: Response): Promise<void> => {
	const txs = await WalletTransaction.find({ user: req.user._id }).sort(
		"-createdAt"
	);
	res.json({ balance: req.user.walletBalance, transactions: txs });
};
