import { Router } from "express";
import { listDebts, payDebt } from "../controllers/debtController";
import { protect } from "../middleware/authMiddleware";

const router = Router();
router.use(protect);
router.get("/:meterNumber", listDebts);
router.post("/pay", payDebt);
export default router;
