import { FileObject, StorageError } from '@supabase/storage-js';
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(process.env.SUPABASE_PROJECT_URL as string, process.env.SUPABASE_SERVICE_KEY as string)

export const UploadSupabase = async (file: Express.Multer.File, folderName: string) => {
    if (!file) {
      throw new Error("No file provided");
    }

    const filePath = `${folderName}/${file.fieldname}-${Date.now()}-${file.originalname}`;

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
export const UploadSupabasePrivate = async (file: Express.Multer.File, folderName: string): Promise<{path: string, id: string, fullPath: string}>=> {
    if (!file) {
      throw new Error("No file provided");
    }
    const filePath = `${folderName}/${file.fieldname}-${Date.now()}-${file.originalname}`;

    const {data, error} = await supabase.storage.from("Student-Files").upload(filePath, file.buffer)

    if(error){
        throw new Error(error.message);
    }
    return {path: data.path, id: data.id, fullPath: data.fullPath}
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

export interface ResponseUploadSupabase {
    success: boolean,
    path: string,
    publicUrl: string
}
export interface UploadSupabasePrivate {
    path: string
    id: string
    fullPath: string
}