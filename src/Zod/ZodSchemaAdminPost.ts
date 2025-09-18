import z, { array } from "zod";
import { toDate, toInt, toJSON } from "./Validator";

export const deleteAdminZodSchema = z.object({
  body: z.object({
    accountId: toJSON().transform((value, cxt) => {
      if (!Array.isArray(value)) {
        cxt.addIssue({
          code: "custom",
          message: "Invalid Array Format!",
        });
        return z.NEVER;
      }
      return value as number[];
    }),
  }),
});
export type deleteAdminZodType = z.infer<typeof deleteAdminZodSchema>;

export const getAllAdminZodSchema = z.object({
  query: z.object({
    page: toInt().optional(),
    dataPerPage: toInt().optional(),
    sortBy: z.string().optional(),
    order: z.string().optional(),
    accountId: toInt().optional(),
  }),
});
export type getAllAdminZodType = z.infer<typeof getAllAdminZodSchema>;

export const searchAdminZodSchema = z.object({
  query: z.object({
    search: z.string(),
    page: toInt().optional(),
    dataPerPage: toInt().optional(),
    accountId: toInt().optional(),
    sortBy: z.string().optional(),
    order: z.string().optional(),
  }),
});
export type searchAdminZodType = z.infer<typeof searchAdminZodSchema>;

export const approveApplicationZodSchema = z.object({
  body: z.object({
    applicationId: toInt(),
    adminId: toInt(),
    scholarshipId: toInt(),
  }),
});
export type approveApplicationZodType = z.infer<
  typeof approveApplicationZodSchema
>;

export const forInterviewZodSchema = z.object({
  body: z.object({
    applicationId: toInt(),
    accountId: toInt(),
    scholarshipId: toInt()
  })
})
export type forInterviewZondType = z.infer<typeof forInterviewZodSchema>

export const declineApplicationZodSchema = z.object({
  body: z.object({
    applicationId: toInt(),
    adminId: toInt(),
    scholarshipId: toInt(),
    rejectMessage: toJSON(),
  }),
});
export type declineApplicationZodType = z.infer<
  typeof declineApplicationZodSchema
>;

export const deleteApplicationsZodSchema = z.object({
  body: z.object({
    applicationId: toJSON().transform((val, cxt) => {
      if (!Array.isArray(val.data)) {
        cxt.addIssue({ code: "custom", message: "Invalid Array Format!" });
      }
      return val.data as number[];
    }),
  }),
});
export type deleteApplicationsZodType = z.infer<
  typeof deleteApplicationsZodSchema
>;

export const getApplicationByIdZodSchema = z.object({
  query: z.object({
    applicationId: toInt(),
  }),
});
export type getApplicationByIdZodType = z.infer<
  typeof getApplicationByIdZodSchema
>;

export const getApplicationZodSchema = z.object({
  query: z.object({
    page: toInt().optional(),
    dataPerPage: toInt().optional(),
    scholarshipId: toInt().optional(),
    status: z.string().optional(),
    sortBy: z.string().optional(),
    order: z.string().optional(),
    filter: toJSON()
      .transform((val, cxt) => {
        if (!Array.isArray(val)) {
          cxt.addIssue({ code: "custom", message: "Invalid Array Format!" });
          return z.NEVER;
        }
        return val as Array<any>;
      })
      .optional(),
  }),
});
export type getApplicationZodType = z.infer<typeof getApplicationZodSchema>;

export const searchApplicationZodSchema = z.object({
  query: z.object({
    page: toInt().optional(),
    dataPerPage: toInt().optional(),
    search: z.string(),
    status: z.string().optional(),
    sortBy: z.string().optional(),
    order: z.string().optional(),
  }),
});
export type searchApplicationZodType = z.infer<
  typeof searchApplicationZodSchema
>;

export const adminAddScholarshipsZodSchema = z.object({
  body: z.object({
    adminId: toInt(),
    scholarshipType: z.string(),
    newScholarTitle: z.string(),
    newScholarProvider: z.string(),
    newScholarDescription: z.string(),
    newScholarDeadline: toDate(),
    isForInterview: z.string(),
    scholarshipAmount: z.string().optional(),
    scholarshipLimit: toInt().optional(),
    gwa: toInt().optional(),
    scholarshipDocuments: toJSON(),
  }),
});
export type adminAddScholarshipsZodType = z.infer<
  typeof adminAddScholarshipsZodSchema
>;

export const updateScholarshipZodSchema = z.object({
  body: z.object({
    scholarshipId: toInt(),
    newScholarProvider: z.string(),
    newScholarTitle: z.string(),
    newScholarDescription: z.string(),
    newScholarDeadline: toDate(),
    scholarshipAmount: z.string().optional(),
    scholarshipLimit: toInt().optional(),
    gwa: toInt().optional(),
    scholarshipDocuments: toJSON(),
    accountId: toInt(),
  }),
});
export type updateScholarshipZodType = z.infer<
  typeof updateScholarshipZodSchema
>;

export const renewalScholarshipZodSchema = z.object({
  body: z.object({
    accountId: toInt(),
    scholarshipId: toInt(),
    newRequirements: toJSON()
  })
})
export type renewalScholarshipZodType = z.infer<typeof renewalScholarshipZodSchema>

export const archiveScholarshipZodSchema = z.object({
  body: z.object({
    accountId: toInt(),
    scholarshipId: toJSON()
  })
})
export type archiveScholarshipZodType = z.infer<typeof archiveScholarshipZodSchema>

export const deleteScholarshipZodSchema = z.object({
  body: z.object({
    scholarshipId: toInt(),
    accountId: toInt(),
  }),
});
export type deleteScholarshipZodType = z.infer<
  typeof deleteScholarshipZodSchema
>;

export const getScholarshipZodSchema = z.object({
  query: z.object({
    dataPerPage: toInt().optional(),
    page: toInt().optional(),
    sortBy: z.string().optional(),
    order: z.string().optional(),
    status: z.string().optional(),
    filters: toJSON().optional(),
  }),
});
export type getScholarshipZodType = z.infer<typeof getScholarshipZodSchema>;

export const getScholarshipsByIdZodSchema = z.object({
  query: z.object({
    scholarshipId: toInt(),
  }),
});
export type getScholarshipsByIdZodType = z.infer<
  typeof getScholarshipsByIdZodSchema
>;

export const searchScholarshipZodSchema = z.object({
  query: z.object({
    dataPerPage: toInt().optional(),
    page: toInt().optional(),
    search: z.string().optional(),
    sortBy: z.string().optional(),
    order: z.string().optional(),
    status: z.string().optional(),
  }),
});
export type searchScholarshipZodType = z.infer<
  typeof searchScholarshipZodSchema
>;

export const getFilterDataZodSchema = z.object({
  query: z.object({
    applicationStatus: z.string().optional(),
    scholarshipStatus: z.string().optional(),
  }),
});
export type getFilterDataZodType = z.infer<typeof getFilterDataZodSchema>;

export const createAnnouncementZodSchema = z.object({
  body: z.object({
    adminId: toInt(),
    announcementTitle: z.string(),
    announcementDescription: z.string(),
    announcementTags: toJSON(),
  }),
});
export type createAnnouncementZodType = z.infer<
  typeof createAnnouncementZodSchema
>;

export const deleteAnnouncementZodSchema = z.object({
    body: z.object({
        announcementId: toJSON()
    })
})
export type deleteAnnouncementZodType = z.infer<typeof deleteAnnouncementZodSchema>

export const getAnnouncementZodSchema = z.object({
    query: z.object({
        page: toInt().optional(),
        dataPerPage: toInt().optional(),
        sortBy: z.string().optional(),
        order: z.string().optional(),
        status: z.string().optional(),
    })
})
export type getAnnouncementZodType = z.infer<typeof getAnnouncementZodSchema>