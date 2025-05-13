import { Request, Response } from "express";
import Debt from "../models/Debt";
import { fetchDebts } from "../services/stsApiService";

export const listDebts = async (req: any, res: Response): Promise<void> => {
	const debts = await fetchDebts(req.params.meterNumber);
	res.json(debts);
};

export const payDebt = async (req: any, res: Response): Promise<void> => {
	const { meterNumber, amount } = req.body;
	// call external payment API if needed
	// log transaction
	res.json({ success: true });
};
