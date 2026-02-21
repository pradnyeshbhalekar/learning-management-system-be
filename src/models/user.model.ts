export interface User {
    id: string;
    email: string;
    fullName: string;
    avatarUrl: string | null;
    role: 'admin' | 'client';
    bio: string | null;
    createdAt: string,
    updatedAt: string
}