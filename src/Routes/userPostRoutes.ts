import { Router } from "express";
import upload from "../Config/upload";
import { applyRenewScholarship, applyScholarship, getAllScholarship, getAnnouncements, getApplications, getNotifications, getRenewScholarship, getScholarshipsbyId, getStudentById } from "../Controller/postController";
import { TokenAuth } from "../Config/TokenAuth";
import { validate } from "../Zod/Validator";
import { applyRenewScholarshipZodSchema, applyScholarshipZodSchema, getAllScholarshipZodSchema, getAnnouncementsZodSchema, getApplicationsZodSchema, getNotificationsZodSchema, getRenewScholarshipZodSchema, getScholarshipsByIdZodSchema, getStudentByIdZodSchema } from "../Zod/ZodSchemaUserPost";

const UserPostRoutes = Router();

UserPostRoutes.use(TokenAuth);
UserPostRoutes.post("/applyScholarship", upload.any(),validate(applyScholarshipZodSchema) ,applyScholarship);
UserPostRoutes.post("/applyRenewScholarship", upload.any(),validate(applyRenewScholarshipZodSchema) ,applyRenewScholarship);

UserPostRoutes.get("/getStudentById", validate(getStudentByIdZodSchema), getStudentById);
UserPostRoutes.get("/getAllScholarship", validate(getAllScholarshipZodSchema), getAllScholarship);
UserPostRoutes.get("/getRenewScholarship", validate(getRenewScholarshipZodSchema), getRenewScholarship);
UserPostRoutes.get("/getScholarshipsById", validate(getScholarshipsByIdZodSchema), getScholarshipsbyId);
UserPostRoutes.get("/getNotifications", validate(getNotificationsZodSchema), getNotifications)
UserPostRoutes.get("/getApplications", validate(getApplicationsZodSchema), getApplications)
UserPostRoutes.get("/getAnnouncements", validate(getAnnouncementsZodSchema), getAnnouncements)

export default UserPostRoutes;