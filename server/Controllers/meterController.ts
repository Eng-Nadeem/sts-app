import { Request, Response } from "express";
import Meter from "../models/Meter";

export const addMeter = async (req: any, res: Response): Promise<void> => {
	const { meterNumber, alias } = req.body;
	const meter = await Meter.create({
		user: req.user._id,
		meterNumber,
		alias,
	});
	res.status(201).json(meter);
};

export const getMeters = async (req: any, res: Response): Promise<void> => {
	const meters = await Meter.find({ user: req.user._id });
	res.json(meters);
};
