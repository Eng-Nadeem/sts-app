import { Request, Response } from "express";
import Transaction from "../models/Transaction";
import { rechargeMeter } from "../services/stsApiService";

export const recharge = async (req: any, res: Response): Promise<void> => {
	const { meterId, amount, paymentMethod } = req.body;
	const meter = req.params.meterId;
	const tokenCode = await rechargeMeter(req.body.meterNumber, amount);
	const tx = await Transaction.create({
		user: req.user._id,
		meter,
		amount,
		paymentMethod,
		tokenCode,
		status: "success",
		transactionType: "recharge",
	});
	res.status(201).json(tx);
};

export const getTransactions = async (
	req: any,
	res: Response
): Promise<void> => {
	const txs = await Transaction.find({ user: req.user._id }).sort(
		"-createdAt"
	);
	res.json(txs);
};
