import { Router } from "express";
import upload from "../Config/upload";
import { applyRenewScholarship, applyScholarship, getAllScholarship, getAnnouncements, getAnnouncementsById, getApplicationHistory, getApplications, getNotifications, 
    getScholarshipsbyId, getStudentApplicationById, getStudentById, searchScholarship, tokenValidation } from "../Controller/postController";
import { TokenAuth } from "../Config/TokenAuth";
import { validate } from "../Zod/Validator";
import { applyRenewScholarshipZodSchema, applyScholarshipZodSchema, getAllScholarshipZodSchema, getAnnouncementsByIdZodSchema, getAnnouncementsZodSchema, 
    getApplicationHistoryZodSchema, 
    getApplicationsZodSchema, getNotificationsZodSchema, getScholarshipsByIdZodSchema, getStudentApplicationByIdZodSchema, getStudentByIdZodSchema, 
    searchScholarshipZodSchema} from "../Zod/ZodSchemaUserPost";

const UserPostRoutes = Router();

UserPostRoutes.use(TokenAuth);
UserPostRoutes.post("/applyScholarship", upload.any(),validate(applyScholarshipZodSchema) ,applyScholarship);
UserPostRoutes.post("/renewScholarship", upload.any(),validate(applyRenewScholarshipZodSchema) ,applyRenewScholarship);

UserPostRoutes.get("/tokenValidation", tokenValidation);

UserPostRoutes.get("/getStudentById", validate(getStudentByIdZodSchema), getStudentById);

UserPostRoutes.get("/getAllScholarship", validate(getAllScholarshipZodSchema), getAllScholarship)
UserPostRoutes.get("/searchScholarship", validate(searchScholarshipZodSchema), searchScholarship)
UserPostRoutes.get("/getScholarshipsById", validate(getScholarshipsByIdZodSchema), getScholarshipsbyId);

UserPostRoutes.get("/getNotifications", validate(getNotificationsZodSchema), getNotifications)

UserPostRoutes.get("/getApplications", validate(getApplicationsZodSchema), getApplications)
UserPostRoutes.get("/getStudentApplicationById", validate(getStudentApplicationByIdZodSchema), getStudentApplicationById)
UserPostRoutes.get("/getApplicationHistory", validate(getApplicationHistoryZodSchema), getApplicationHistory)

UserPostRoutes.get("/getAnnouncements", validate(getAnnouncementsZodSchema), getAnnouncements)
UserPostRoutes.get("/getAnnouncementsById", validate(getAnnouncementsByIdZodSchema), getAnnouncementsById)


export default UserPostRoutes;