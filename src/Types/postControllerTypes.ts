export interface fileNameTypes {
    label: string,
    formats: string[]
}
export type applicationFilesTypes = {
    document: string,
    fileFormat: string,
    resourceType: string,
    supabasePath: string,
    fileUrl?: string
    requirementType: string
}
export type RecordApplicationFilesTypes = Record<string, applicationFilesTypes[]>

export type DocumentEntry = {
    label: string;
    formats: string[];
    requirementType: string;
};
export type RecordDocumentEntry = Record<string, DocumentEntry>