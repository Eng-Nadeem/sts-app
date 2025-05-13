import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";

export interface AuthRequest extends Request {
	user?: IUser;
}

export const protect = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	let token;
	if (req.headers.authorization?.startsWith("Bearer")) {
		token = req.headers.authorization.split(" ")[1];
		try {
			const decoded = jwt.verify(
				token,
				process.env.JWT_SECRET as string
			) as { id: string };
			req.user = await User.findById(decoded.id).select("-password");
			next();
		} catch (error) {
			res.status(401).json({ message: "Not authorized" });
		}
	} else {
		res.status(401).json({ message: "No token" });
	}
};
