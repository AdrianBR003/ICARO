export interface OrcidWork {
    title: string;
    year: string;
    type: string;
    putCode: string;
}

export interface OrcidPreviewDTO {
    orcidId: string;
    firstName: string;
    lastName: string;
    biography: string;
    email: string | null;
    works: OrcidWork[];
}

export interface AnalyzedWork {
    putCode: string;
    title: string;
    year: string;
    type: string;
    isDuplicate: boolean;
    duplicateReason?: string;
    existingWorkId?: number;
}