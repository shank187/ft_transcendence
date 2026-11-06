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
    equipment: Equipment[];
    
}

export interface Equipment {
    id: string;
    name : string;
    imageUrl? : string;
}
