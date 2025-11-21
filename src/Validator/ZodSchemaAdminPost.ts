import z, { array } from "zod";
import { toDate, toFloat, toInt, toJSON } from "./Validator";
const labelRegex = /^[A-Za-z0-9 ()_.\-]+$/;

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

export const validateStaffZodSchema = z.object({
  body: z.object({
    staffId: toInt()
  }),
});
export type validateStaffZodType = z.infer<typeof validateStaffZodSchema>;

export const deleteISPSU_StaffZodSchema = z.object({
  body: z.object({
    staffId: toInt()
  }),
});
export type deleteISPSU_StaffZodType = z.infer<typeof deleteISPSU_StaffZodSchema>;

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

export const getStaffByIdZodSchema = z.object({
  query: z.object({
    staffId: toInt()
  })
})
export type getStaffByIdZodType = z.infer<typeof getStaffByIdZodSchema>

export const approveApplicationZodSchema = z.object({
  body: z.object({
    applicationId: toInt(),
    scholarshipId: toInt(),
    rejectMessage: toJSON(),
  }),
});
export type approveApplicationZodType = z.infer<
  typeof approveApplicationZodSchema
>;

export const forInterviewZodSchema = z.object({
  body: z.object({
    applicationId: toInt(),
    scholarshipId: toInt(),
    rejectMessage: toJSON()
  })
})
export type forInterviewZondType = z.infer<typeof forInterviewZodSchema>

export const declineApplicationZodSchema = z.object({
  body: z.object({
    applicationId: toInt(),
    scholarshipId: toInt(),
    rejectMessage: toJSON(),
  }),
});
export type declineApplicationZodType = z.infer<
  typeof declineApplicationZodSchema
>;

export const getFileUrlZodSchemaZodSchema = z.object({
  body: z.object({
    applicationId: toInt(),
    path: z.string()
  }),
})
export type getFileUrlZodSchemaZodType = z.infer<
  typeof getFileUrlZodSchemaZodSchema
>

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
    filters: toJSON()
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
    scholarshipType: z.string().min(1).trim(),
    newScholarTitle: z.string().min(1).trim(),
    newScholarProvider: z.string().min(1).trim(),
    newScholarDescription: z.string().min(1).trim(),
    newScholarDeadline: toDate(),
    isForInterview: z.string(),
    scholarshipAmount: z.string().optional(),
    scholarshipLimit: toInt().optional(),
    gwa: toFloat().optional(),
    scholarshipDocuments: toJSON(),
  }),
});
export type adminAddScholarshipsZodType = z.infer<
  typeof adminAddScholarshipsZodSchema
>;

export const updateScholarshipZodSchema = z.object({
  body: z.object({
    scholarshipId: toInt(),
    newScholarProvider: z.string().min(1).trim(),
    newScholarTitle: z.string().min(1).trim(),
    newScholarDescription: z.string().min(1).trim(),
    newScholarDeadline: toDate(),
    scholarshipAmount: z.string().optional(),
    scholarshipLimit: toInt().optional(),
    gwa: toFloat().optional(),
    scholarshipDocuments: toJSON(),
  }),
});
export type updateScholarshipZodType = z.infer<
  typeof updateScholarshipZodSchema
>;

export const renewalScholarshipZodSchema = z.object({
  body: z.object({
    scholarshipId: toInt(),
    renewDocuments: toJSON(),
    renewDeadline: toDate(),
    isForInterview: z.enum(["true", "false"]),
  })
})
export type renewalScholarshipZodType = z.infer<typeof renewalScholarshipZodSchema>

export const endScholarshipZodSchema = z.object({
  body: z.object({
    scholarshipId: toInt(),
  })
})
export type endScholarshipZodType = z.infer<typeof endScholarshipZodSchema>

export const deleteScholarshipZodSchema = z.object({
  body: z.object({
    scholarshipId: toInt(),
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
    search: z.string().optional()
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

export const getFilterDataZodSchema = z.object({
  query: z.object({
    applicationStatus: z.string().optional(),
    scholarshipStatus: z.string().optional(),
  }),
});
export type getFilterDataZodType = z.infer<typeof getFilterDataZodSchema>;

export const createAnnouncementZodSchema = z.object({
  body: z.object({
    announcementTitle: z.string().min(1).trim(),
    announcementDescription: z.string().min(1).trim().optional(),
    announcementTags: toJSON().optional(),
  }),
});
export type createAnnouncementZodType = z.infer<
  typeof createAnnouncementZodSchema
>;

export const deleteAnnouncementZodSchema = z.object({
    body: z.object({
        announcementId: toInt()
    })
})
export type deleteAnnouncementZodType = z.infer<typeof deleteAnnouncementZodSchema>

export const editAnnouncementZodSchema = z.object({
  body: z.object({
    announcementId: toInt(),
    title: z.string().min(1).trim().optional(),
    description: z.string().min(1).trim().optional(),
    tags: toJSON().optional(),
  })
})
export type editAnnouncementZodType = z.infer<typeof editAnnouncementZodSchema>

export const getAnnouncementZodSchema = z.object({
    query: z.object({
        page: toInt().optional(),
        dataPerPage: toInt().optional(),
        sortBy: z.string().optional(),
        order: z.string().optional(),
        status: z.string().optional(),
        search: z.string().optional()
    })
})
export type getAnnouncementZodType = z.infer<typeof getAnnouncementZodSchema>

export const getAnnouncementByIdZodSchema = z.object({
  query:z.object({
    announcementId: toInt()
  })
})
export type getAnnouncementByIdZodType = z.infer<typeof getAnnouncementByIdZodSchema>

export const getStaffLogsZodSchema = z.object({
  query:z.object({
    page: toInt().optional(),
    dataPerPage: toInt().optional(),
    sortBy: z.string().optional(),
    order: z.string().optional(),
    ownderId: toInt().optional(),
    filters: toJSON().optional()
  })
})
export type getStaffLogsZodType = z.infer<typeof getStaffLogsZodSchema>

export const updateStudentAccountZodSchema = z.object({
  body: z.object({
    ownerId: toInt(),
    email: z.email().min(1).trim().optional(),
    newPassword: z.string().min(8).trim().optional(),
    schoolId: z.string().min(1).trim().optional(),
    fName: z.string().min(1).trim().optional(),
    lName: z.string().min(1).trim().optional(),
    mName: z.string().min(1).trim().optional(),
    contactNumber: z.string().min(10).trim().optional(),
    gender: z.string().optional(),
    address: z.string().min(1).trim().optional(),
    indigenous: z.string().optional(),
    PWD: z.string().optional(),
    institute: z.string().min(1).trim().optional(),
    course: z.string().min(1).trim().optional(),
    year: z.string().min(1).trim().optional(),
    section: z.string().min(1).trim().optional(),
    dateOfBirth: toDate().optional(),
  })
})
export type updateStudentAccountZodType = z.infer<typeof updateStudentAccountZodSchema>

export const deleteStudentZodSchema = z.object({
  body: z.object({
    ownerId: toInt()
  })
})
export type deleteStudentZodType = z.infer<typeof deleteStudentZodSchema>

export const getStudentsZodSchema = z.object({
  query: z.object({
    page: toInt().optional(),
    dataPerPage: toInt().optional(),
    sortBy: z.string().optional(),
    order: z.string().optional(),
    ownderId: toInt().optional(),
    filters: toJSON().optional()
  })
})
export type getStudentsZodType = z.infer<typeof getStudentsZodSchema>

export const getStudentsByIdZodSchema = z.object({
  query: z.object({
    ownerId: toInt()
  })
})
export type getStudentsByIdZodType = z.infer<typeof getStudentsByIdZodSchema>

export const searchStudentZodSchema = z.object({
  query: z.object({
    accountId: toInt(),
    search: z.string(),
    page: toInt().optional(),
    dataPerPage: toInt().optional(),
    sortBy: z.string().optional(),
    order: z.string().optional(),
    ownderId: toInt().optional(),
    filters: toJSON().optional()
  })
})
export type searchStudentZodType = z.infer<typeof searchStudentZodSchema>

export const getFiltersCSVZodSchema = z.object({
  query: z.object({
    scholarship: toJSON().refine(e => Array.isArray(e) && e.every(item => typeof item === "string"), {message: "Must be an Array of Strings"}).optional(),
    applicationStatus: toJSON().refine(e => Array.isArray(e) && e.every(item => typeof item === "string"), {message: "Must be an Array of Strings"}).optional(),
    studentInstitute: toJSON().refine(e => Array.isArray(e) && e.every(item => typeof item === "string"), {message: "Must be an Array of Strings"}).optional(),
    studentCourse: toJSON().refine(e => Array.isArray(e) && e.every(item => typeof item === "string"), {message: "Must be an Array of Strings"}).optional(),
    studentYear: toJSON().refine(e => Array.isArray(e) && e.every(item => typeof item === "string"), {message: "Must be an Array of Strings"}).optional(),
    studentSection: toJSON().refine(e => Array.isArray(e) && e.every(item => typeof item === "string"), {message: "Must be an Array of Strings"}).optional(),
  })
})
export type getFiltersCSVZodType = z.infer<typeof getFiltersCSVZodSchema>

export const downloadApplicationCSVZodSchema = z.object({
  query: z.object({
    filters: toJSON().refine(e => (Array.isArray(e) && e.every(item => typeof item == "object"))).optional(),
    dataSelections: toJSON().refine(e => Array.isArray(e) && e.every(item => typeof item == "string")),
    AtoZ: toJSON().refine((e) => typeof e == "object" && e?.start && e?.end , {message: "Error Value!"}).optional(),
    order: z.string().refine(e => e === "asc" || e === "desc", {message: "Error Value!"}).optional(),
    gender: z.string().refine(e => e === "Male" || e === "Female", {message: "Error Value!"}).optional()
  })
})
export type downloadApplicationCSVZodType = z.infer<typeof downloadApplicationCSVZodSchema>

export const downloadStudentsCSVZodSchema = z.object({
  query: z.object({
    filters: toJSON().optional(),
    dataSelections: toJSON()
  })
})
export type downloadStudentsCSVZodType = z.infer<typeof downloadStudentsCSVZodSchema>