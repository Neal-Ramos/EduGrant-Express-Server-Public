import { FileObject, StorageError } from '@supabase/storage-js';
import { createClient } from '@supabase/supabase-js'
import { normalizeString } from './normalizeString';

export const supabase = createClient(process.env.SUPABASE_PROJECT_URL as string, process.env.SUPABASE_SERVICE_KEY as string)
   
export const UploadSupabase = async (file: Express.Multer.File, folderName: string) => {
    if (!file) {
      throw new Error("No file provided");
    }

    const filePath = `${normalizeString(folderName)}/${normalizeString(file.fieldname)}-${Date.now()}-${normalizeString(file.originalname)}`;

    const { data, error } = await supabase.storage.from("Edugrant-Files").upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new Error(error.message);
    }

    const { data: publicUrlData } = supabase.storage.from("Edugrant-Files").getPublicUrl(filePath);

    return {success: true, path: data?.path, publicUrl: publicUrlData.publicUrl,};
}

export const DeleteSupabase = async (Files: Array<string>):Promise<{success: boolean, data?: FileObject[], error?:StorageError|unknown}> => {
    try {
        const {data, error} = await supabase.storage.from("Edugrant-Files").remove(Files)
        if(error){
            throw new Error(error.message);
        }
        return {success: true, data}        
    } catch (error) {
        return { success: false, error};
    }
}

export const UploadSupabasePrivate = async (file: Express.Multer.File, folderName: string): Promise<{path: string, id: string, fullPath: string}>=> {
    if (!file) {
      throw new Error("No file provided");
    }
    
    const filePath = `${normalizeString(folderName)}/${normalizeString(file.fieldname)}-${Date.now()}-${normalizeString(file.originalname)}`;

    const {data, error} = await supabase.storage.from("Student-Files").upload(filePath, file.buffer, {contentType: file.mimetype})

    if(error){
        throw new Error(error.message);
    }
    return {path: data.path, id: data.id, fullPath: data.fullPath}
}

export const SupabaseDeletePrivateFile = async (Files: Array<string>):Promise<{success: boolean, data?: FileObject[], error?:StorageError|unknown}> => {
    try {
        const {data, error} = await supabase.storage.from("Student-Files").remove(Files)
        if(error){
            throw new Error(error.message);
        }
        return {success: true, data}        
    } catch (error) {
        return { success: false, error};
    }
}

export const SupabaseCreateSignedUrl = async(path: string): Promise<{success: boolean, message: string, signedURLs?: string}> => {
    try {
        const {data, error} = await supabase.storage.from("Student-Files").createSignedUrl(path, 2 * 60)
        if(error){
            return {success: false, message: "Create Sign URL Error!"}
        }
        
        return {success: true, message: "Signed URL Ready", signedURLs: data.signedUrl}
    } catch (error) {
        console.error("Error creating signed URLs:", error)
        return { success: false, message: "Failed to create signed URLs" }
    }
}

export const SupabaseDownloadFile = async(path: string): Promise<{success: boolean, message: string, downloadURL?: string}>=> {
    try {
        const {data, error} = await supabase.storage.from("Student-Files").createSignedUrl(path, 10)
        if(error){
            return {success: false, message: "Create Sign URL Error!"}
        }
        
        return {success: true, message: "Signed URL Ready", downloadURL: `${data.signedUrl}&download=1`}
    } catch (error) {
        console.error("Error creating signed URLs:", error)
        return { success: false, message: "Failed to create signed URLs" }
    }
}

export interface ResponseUploadSupabase {
    success: boolean,
    path: string,
    publicUrl: string
}
export interface ResponseUploadSupabasePrivate {
    path: string
    id: string
    fullPath: string
}