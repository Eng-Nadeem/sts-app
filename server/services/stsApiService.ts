import axios from "axios";

const BASE_URL = process.env.STS_API_URL;

export const rechargeMeter = async (
	meterNumber: string,
	amount: number
): Promise<string> => {
	const { data } = await axios.post(`${BASE_URL}/recharge`, {
		meterNumber,
		amount,
	});
	return data.token;
};

export const fetchDebts = async (
	meterNumber: string
): Promise<{ amountDue: number; dueDate: string }[]> => {
	const { data } = await axios.get(`${BASE_URL}/debts/${meterNumber}`);
	return data.debts;
};
