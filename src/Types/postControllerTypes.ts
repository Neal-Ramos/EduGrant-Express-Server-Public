export interface fileNameTypes {
    label: string,
    formats: string[]
}
export interface ScholarshipApplicationData {
    supabasePath: string[],
    submittedDocuments: {
        [key: string]:{
            document?: string,
            fileFormat?: string,
            resourceType?: string,
            supabasePath?: string,
            fileUrl?: string
            requirementType?: string
        }
    }
}