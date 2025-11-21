import { S3 } from 'aws-sdk';
import { createReadStream, unlinkSync } from 'fs';

export const s3 = new S3({
  endpoint: process.env.WASABI_ENDPOINT,
  region: process.env.WASABI_REGION,
  accessKeyId: process.env.WASABI_ACCESS_KEY,
  secretAccessKey: process.env.WASABI_SECRET_KEY,
  signatureVersion: 'v4',
});
const BucketName: string = process.env.WASABI_BUCKET_NAME as string;

export const WasabiUpload = async (
  file: Express.Multer.File,
  folderName: string,
): Promise<{ success: boolean; message: string; path?: string }> => {
  try {
    const filePath: string = `${folderName}/${Date.now()}-${file.originalname}`;

    const uploadResult = await s3
      .upload({
        Bucket: BucketName,
        Key: filePath,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
      .promise();

    if (!uploadResult) {
      throw new Error('Upload File Failed!');
    }
    return { success: true, message: 'Upload File Success!', path: uploadResult.Key };
  } catch (error: any) {
    console.log(error);
    return { success: false, message: error.message };
  }
};
export const WasabiCreateSignedURL = async (
  path: string,
): Promise<{ success: boolean; message: string; signedUrl?: string }> => {
  try {
    const signedUrl = await s3.getSignedUrl('getObject', {
      Bucket: BucketName,
      Key: path,
      Expires: 60 * 5,
    });
    if (!signedUrl) {
      return { success: false, message: 'Create Sign URL Error!' };
    }

    if (!signedUrl) throw new Error('Signed URL Error!');

    return { success: true, message: 'Signed URL Ready!', signedUrl };
  } catch (error: any) {
    console.log(error);
    return { success: false, message: error.message };
  }
};
export const WasabiDownloadFile = async (
  path: string,
): Promise<{ success: boolean; message: string; downloadURL?: string }> => {
  try {
    const signedUrl = await s3.getSignedUrl('getObject', {
      Bucket: BucketName,
      Key: path,
      Expires: 60 * 5,
    });
    if (!signedUrl) {
      return { success: false, message: 'Create Sign URL Error!' };
    }

    return { success: true, message: 'Signed URL Ready', downloadURL: `${signedUrl}&download=1` };
  } catch (error) {
    console.error('Error creating signed URLs:', error);
    return { success: false, message: 'Failed to create signed URLs' };
  }
};
// export const WasabiDeletePrivateFile = async (Path: Array<string>):Promise<{success: boolean, data?: FileObject[], error?:StorageError|unknown}> => {
//     try {
//         const Delete = s3.deleteObject({
//             Bucket: BucketName,
//             Key: Path
//         }).promise()
//         if(error){
//             throw new Error(error.message);
//         }
//         return {success: true, data}
//     } catch (error) {
//         return { success: false, error};
//     }
// }
