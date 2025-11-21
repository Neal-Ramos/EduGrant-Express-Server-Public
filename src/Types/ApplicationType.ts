import { Prisma } from "../lib/prisma"

export type DenormalizeApplicationType = Prisma.ApplicationGetPayload<{
    include:{
        Application_Decision: true,
        Interview_Decision: true,
        Scholarship: true,
        Student:true
    }
}>
export type ApplicationWithRelation = Prisma.ApplicationGetPayload<{
    include:{
        Application_Decision: true,
        Interview_Decision: true,
        Staff_Logs: true,
        Student_Notifications: true,
        Student:true
        Scholarship: true,
    }
}>
export type prismaGetApplicationType = Prisma.ApplicationGetPayload<{
    include:{Student: {include:{Account: {select:{accountId: true, schoolId: true, email: true, role: true}}}}, Scholarship: true, Application_Decision:true, Interview_Decision: true}
}>
export type ApplicationWithScholarshipType = Prisma.ApplicationGetPayload<{
    include: {Scholarship: true}
}>
export type prismaApproveApplicationType = Prisma.ApplicationGetPayload<{
    include:{
        Student: true,
        Scholarship: true,
        Application_Decision: {include: {ISPSU_Staff: true}},
        Interview_Decision: {include: {ISPSU_Staff: true}}
    }
}>
export type prismaAcceptForInterviewType = Prisma.ApplicationGetPayload<{
    include:{
        Student:{
            include:{
                Account:{
                    select:{
                        email: true,
                        schoolId: true
                    }
                }
            }
        },
        Scholarship:{
            include:{
                Scholarship_Provider: {
                    select:{
                        name:true
                    }
                }
            }
        },
        Interview_Decision: {
            include:{
                ISPSU_Staff:{
                    include:{
                        Account:{
                            select:{
                                email:true
                            }
                        }
                    }
                }
            }
        },
        Application_Decision: {
            include:{
                ISPSU_Staff:{
                    include:{
                        Account:{
                            select:{
                                email:true
                            }
                        }
                    }
                }
            }
        }
    }
}>
export type prismaDeclineApplicationType = Prisma.ApplicationGetPayload<{
    include:{
        Student:{
            include:{
                Account:{
                    select:{
                        email:true,
                        schoolId:true
                    }
                }
            }
        },
        Scholarship:{include: {Scholarship_Provider: {select:{name:true}}}},
        Application_Decision: {include: {ISPSU_Staff: true}},
        Interview_Decision: {include: {ISPSU_Staff: true}}
    }
}>
export type prismaCreateApplicationType = Prisma.ApplicationGetPayload<{
    include:{
        Student: {
            include:{
                Account: {
                    select:{
                        email: true,
                        schoolId: true
                    }
                }
            }
        },
        Scholarship: {
            include:{
                Scholarship_Provider: {
                    select:{
                        name: true
                    }
                },
                Application:{
                    select:{applicationId: true}
                }
            }
        },
        Interview_Decision: true,
        Application_Decision: true
    }
}>
export type prismaRenewApplicationType = Prisma.ApplicationGetPayload<{
    include:{
            Student: {
                include:{
                    Account: {
                        select:{
                            email: true,
                            schoolId: true
                        }
                    }
                }
            },
            Scholarship:{
                include:{
                    Scholarship_Provider:{
                        select:{
                            name:true
                        }
                    }
                }
            },
            Interview_Decision: true,
            Application_Decision: true
        }
}>
export type familyBackgroundType = {
    fatherStatus?: string,
    motherStatus?: string,
    fatherAddress?: string,
    motherAddress?: string,
    fatherFullName?: string,
    motherFullName?: string,
    fatherOccupation?: string,
    motherOccupation?: string,
    fatherContactNumber?: string,
    motherContactNumber?: string,
    fatherHighestEducation?: string,
    motherHighestEducation?: string,
    fatherTotalParentsTaxableIncome?: string,
    motherTotalParentsTaxableIncome?: string,
    guardianTotalParentsTaxableIncome?: string,
}