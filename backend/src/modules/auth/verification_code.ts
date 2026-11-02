import { randomInt } from 'crypto';

export function generate_verification_code(): string {
    return randomInt(100000, 1000000).toString();
}
    
