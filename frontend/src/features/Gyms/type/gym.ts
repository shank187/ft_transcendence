export interface Equipment {
    id: string;
    name : string;
    imageUrl? : string;
    category?: string;
}

export interface GymEquipmentItem {
    gymId: string;
    equipmentId: string;
    quantity?: number | null;
    equipment: Equipment;
}
export interface Gym{
    id: string;
    name: string;
    description?: string | null;
    address?: string | null;
    city?: string | null;
    imageUrl?: string | null;
    phone?: string | null;
    website?: string | null;
    verified?: boolean;   
    visibility?: "PUBLIC" | "PRIVATE";
    latitude?: number | null;
    longitude?: number | null; 
    equipment: GymEquipmentItem[];
    
}

export type GymSubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";
export type GymRejectReason = "ALREADY_LISTED" | "NOT_A_GYM" | "CANT_CONFIRM" | "OTHER";

export interface GymSubmission {
    id: string;
    status: GymSubmissionStatus;
    submitterId: string;
    gymId?: string | null;
    privateCopyId?: string | null;
    name?: string | null;
    city?: string | null;
    address?: string | null;
    closed: boolean;
    note?: string | null;
    seenOn?: string | null;
    reviewerId?: string | null;
    reviewedAt?: string | null;
    rejectReason?: GymRejectReason | null;
    rejectDetail?: string | null;
    createdAt: string;
    updatedAt: string;
    submitter?: {
        email: string;
        username: string;
    };
}

