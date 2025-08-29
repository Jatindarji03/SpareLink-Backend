import { Router } from "express";
import { createRole,getRoles } from "../controllers/role.controller.js";

const router = Router();
router.post("/create-role", createRole);
router.get("/get-roles", getRoles);
export default router;