import express from "express";
import { saveResume,getResumes} from "../controllers/resume.controller.js";

const router = express.Router();

router.post("/save", saveResume);
router.get("/getresumes",getResumes);

export default router;
