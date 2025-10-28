import { Router } from "express";
import { getAnnouncementsZodSchema } from "../Zod/ZodSchemaUserPost";
import { getAnnouncementsPublic, uploadWasabi } from "../Controller/publicController";
import { validate } from "../Zod/Validator";
import upload from "../Config/upload";

 

const PublicRoutes = Router()

PublicRoutes.post("/uploadWasabi", upload.any(), uploadWasabi)

PublicRoutes.get("/getAnnouncementsPublic", validate(getAnnouncementsZodSchema), getAnnouncementsPublic)

export default PublicRoutes