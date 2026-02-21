export interface Certificate {
    id: string;
    user_id: string;
    course_id: string;
    issued_at: string;
    certificate_url: string;
    status: 'issued' | 'pending';
}

export interface CreateCertificateDTO {
    user_id: string;
    course_id: string;
    certificate_url: string;
    status?: 'issued' | 'pending';
}
