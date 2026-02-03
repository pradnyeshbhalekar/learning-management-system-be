export type courseLevel = "Beginner" | "Intermediate" | "Advanced";

export interface Course {
    id: string;
    title: string;
    description: string;
    category: string;
    level: courseLevel;
    instructorId: string | null;
    thumbnailUrl: string | null;
    rating: number;
    totalStudents: number;
    createdAt: string;
    updatedAt: string;
}