import { DenormalizeApplicationType } from '../Types/ApplicationType';
import { RecordApplicationFilesTypes } from '../Types/postControllerTypes';

export function ValidateApplication() {}

export function DenormalizeApplication(Application: DenormalizeApplicationType) {
  const k: any = {};
  for (const [key, value] of Object.entries(Application.submittedDocuments as RecordApplicationFilesTypes)) {
    k[key] = {
      documents: value,
      Application_Decision: Application.Application_Decision.find((f) => `phase-${f.scholarshipPhase}` === key),
      Interview_Decision: Application.Interview_Decision.find((f) => `phase-${f.scholarshipPhase}` === key),
    };
  }

  return {
    applicationId: Application.applicationId,
    scholarshipId: Application.scholarshipId,
    ownerId: Application.ownerId,
    status: Application.status,
    supabasePath: Application.supabasePath,
    submittedDocuments: k,
    Application_Decision: Application.Application_Decision,
    Interview_Decision: Application.Interview_Decision,
    Student: Application.Student,
    Scholarship: Application.Scholarship,
    dateCreated: Application.dateCreated,
  };
}

export function GenerateAlphabet(start: string, end: string) {
  const startCode = start.charCodeAt(0);
  const endCode = end.charCodeAt(0);

  if (startCode < 65 || endCode > 90 || startCode > endCode) {
    return undefined;
  }
  return Array.from({ length: endCode - startCode + 1 }, (_, i) => String.fromCharCode(startCode + i));
}
