import z from "zod";
import { toInt, toJSON } from "./Validator";


export const applyScholarshipZodSchema = z.object({
    body: z.object({
        scholarshipId: toInt(),
    })
})
export type applyScholarshipZodType = z.infer<typeof applyScholarshipZodSchema>

export const applyRenewScholarshipZodSchema = z.object({
    body: z.object({
        scholarshipId: toInt(),
    })
})

export const downloadScholarshipFormZodSchema = z.object({
    body: z.object({
        scholarshipId: toInt()
    })
})
export type downloadScholarshipFormZodType = z.infer<typeof downloadScholarshipFormZodSchema>

export const getStudentByIdZodSchema = z.object({
    query: z.object({
        accountId: toInt()
    })
})
export type getStudentByIdZodType = z.infer<typeof getStudentByIdZodSchema>

export const getAllScholarshipZodSchema = z.object({
    query: z.object({
        dataPerPage: toInt().optional(),
        page: toInt().optional(),
        sortBy: z.string().optional(),
        order: z.string().optional(),
        status: z.string().optional(),
        filters: toJSON().optional(),
    })
})
export type getAllScholarshipZodType = z.infer<typeof getAllScholarshipZodSchema>

export const searchScholarshipZodSchema = z.object({
    query: z.object({
        dataPerPage: toInt().optional(),
        page: toInt().optional(),
        sortBy: z.string().optional(),
        order: z.string().optional(),
        status: z.string().optional(),
        filters: toJSON().optional(),
        search: z.string().optional()
    })
})
export type searchScholarshipZodType = z.infer<typeof searchScholarshipZodSchema>

export const getScholarshipsByIdZodSchema = z.object({
    query: z.object({
        scholarshipId: toInt()
    })
})
export type getScholarshipsByIdZodType = z.infer<typeof getScholarshipsByIdZodSchema>

export const getNotificationsZodSchema = z.object({
    query: z.object({
        dataPerPage: toInt().optional(),
        page: toInt().optional(),
        status: z.string().optional(),
        sortBy: z.string().optional(),
        order: z.string().optional(),
    })
})
export type getNotificationsZodType = z.infer<typeof getNotificationsZodSchema>

export const getApplicationsZodSchema = z.object({
    query:z.object({
        page: toInt().optional(),
        dataPerPage: toInt().optional(),
        scholarshipId: toInt().optional(),
        status: z.string().optional(),
        sortBy: z.string().optional(),
        order: z.string().optional(),
        filter: toJSON().optional(),
        search: z.string().optional()
    })
})
export type getApplicationsZodType = z.infer<typeof getApplicationsZodSchema>

export const getStudentApplicationByIdZodSchema = z.object({
    query:z.object({
        applicationId: toInt()
    })
})
export type getStudentApplicationByIdZodType = z.infer<typeof getStudentApplicationByIdZodSchema>

export const getApplicationHistoryZodSchema = z.object({
    query:z.object({
        page: toInt().optional(),
        dataPerPage: toInt().optional(),
        scholarshipId: toInt().optional(),
        status: z.string().optional(),
        sortBy: z.string().optional(),
        order: z.string().optional(),
        filter: toJSON().optional(),
        search: z.string().optional()
    })
})
export type getApplicationHistoryZodType = z.infer<typeof getApplicationHistoryZodSchema>

export const getAnnouncementsZodSchema = z.object({
    query: z.object({
        page: toInt().optional(),
        dataPerPage: toInt().optional(),
        sortBy: z.string().optional(),
        order: z.string().optional(),
        status: z.string().optional(),
        search: z.string().optional()
    })
})
export type getAnnouncementsZodType = z.infer<typeof getAnnouncementsZodSchema>

export const getAnnouncementsByIdZodSchema = z.object({
    query: z.object({
        annoucementId: toInt()
    })
})
export type getAnnouncementsByIdZodType = z.infer<typeof getAnnouncementsByIdZodSchema>