import { Router } from "express";
import { adminCodeAuthentication, adminLogIn, adminTokenAuthentication, createISPSUStaffAccount } from "../Controller/adminAuthControllers";
import upload from "../Config/upload";
import { validate } from "../Zod/Validator";
import { adminCodeAuthenticationZodSchema, adminLoginZodSchema, adminTokenAuthenticationZodSchema, createAccountZodSchema, superAdminTokenAuthenticationZodSchema } from "../Zod/ZodSchemanAdminAuth";

const AdminAuthRoutes = Router();

AdminAuthRoutes.post("/createAccount", validate(createAccountZodSchema), createISPSUStaffAccount);
AdminAuthRoutes.post("/adminLogin", validate(adminLoginZodSchema), adminLogIn);
AdminAuthRoutes.post("/adminCodeAuthentication", validate(adminCodeAuthenticationZodSchema), adminCodeAuthentication);
AdminAuthRoutes.get("/adminTokenAuthentication", validate(adminTokenAuthenticationZodSchema), adminTokenAuthentication);

export default AdminAuthRoutes;