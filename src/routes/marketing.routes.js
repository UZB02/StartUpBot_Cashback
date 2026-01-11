import express from "express";
import { sendMarketingByFilial, previewMarketingMessage } from "../controllers/marketing.controller.js";

const router = express.Router();

router.post("/send", sendMarketingByFilial);
router.post("/preview", previewMarketingMessage);

export default router;
