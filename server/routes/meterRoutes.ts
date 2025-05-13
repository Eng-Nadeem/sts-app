import { Router } from "express";
import { addMeter, getMeters } from "../controllers/meterController";
import { protect } from "../middleware/authMiddleware";

const router = Router();
router.use(protect);
router.post("/", addMeter);
router.get("/", getMeters);
export default router;
