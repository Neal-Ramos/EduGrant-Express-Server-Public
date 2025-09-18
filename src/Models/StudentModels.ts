import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const prismaFiltersStudent = async(status: string|undefined): Promise<{}>=> {

    const StudentFilter = await prisma.student.findMany({
        distinct:['course', 'year', 'section'],
        where:{
            Application:{
                some:{
                    status: status? status : undefined
                }
            }
        },
        select:{
            course: true,
            year: true,
            section: true
        }
    })
    return {course: StudentFilter.map(item=>item.course), year: StudentFilter.map(item=>item.year), section: StudentFilter.map(item=>item.section)};
}