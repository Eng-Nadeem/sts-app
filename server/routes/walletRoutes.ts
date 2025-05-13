import { Router } from "express";
import { topUp, getWallet } from "../controllers/walletController";
import { protect } from "../middleware/authMiddleware";

const router = Router();
router.use(protect);
router.post("/topup", topUp);
router.get("/", getWallet);
export default router;
