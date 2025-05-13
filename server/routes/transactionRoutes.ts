import { Router } from "express";
import {
	recharge,
	getTransactions,
} from "../controllers/transactionController";
import { protect } from "../middleware/authMiddleware";

const router = Router();
router.use(protect);
router.post("/recharge", recharge);
router.get("/", getTransactions);
export default router;
