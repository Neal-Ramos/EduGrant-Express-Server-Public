import { Prisma } from "../lib/prisma"

export interface filtersDataTypes {
    id: string,
    value: string
}
export interface parsedRequirementsTypes extends Prisma.JsonArray {
    label: string
    formats:Array<string>
    requirementType: string
}