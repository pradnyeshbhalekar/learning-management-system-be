
import { JWTPayload } from 'jose';

declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload & {
                userId?: string;
                role?: string;
                [key: string]: any;
            };
        }
    }
}
