import { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { isEligibleForCertificate } from '../services/certificateEligibility.service';
import { sendCertificateEmail } from '../services/email.service';

export async function generateCertificateInternal(userId: string, courseId: string) {
    try {
        // 1. Check if eligible
        const eligible = await isEligibleForCertificate(userId, courseId);
        if (!eligible) return null;

        // 2. Check if certificate already exists
        const { data: existing } = await supabaseAdmin
            .from('certificates')
            .select('id')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .maybeSingle();

        if (existing) return existing;

        // 3. Create certificate record
        const placeholderUrl = '/certificates/placeholder.png'; // Static placeholder URL
        const { data: certificate, error: insertError } = await supabaseAdmin
            .from('certificates')
            .insert({
                user_id: userId,
                course_id: courseId,
                certificate_url: placeholderUrl,
                status: 'pending',
                issued_at: new Date().toISOString(),
            })
            .select(`
        *,
        users (email, full_name),
        courses (title)
      `)
            .single();

        if (insertError) {
            console.error(insertError);
            return null;
        }

        return certificate;
    } catch (error) {
        console.error('Error in generateCertificateInternal:', error);
        return null;
    }
}

export async function generateCertificate(req: Request, res: Response) {
    const { userId, courseId } = req.body;

    if (!userId || !courseId) {
        return res.status(400).json({ error: 'userId and courseId are required' });
    }

    const certificate = await generateCertificateInternal(userId, courseId);
    if (!certificate) {
        return res.status(400).json({ error: 'Failed to generate certificate or user not eligible' });
    }

    res.status(201).json({ message: 'Certificate generated and email sent', certificate });
}

export async function getUserCertificates(req: Request, res: Response) {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
    }

    const { data, error } = await supabaseAdmin
        .from('certificates')
        .select(`
      *,
      courses (title)
    `)
        .eq('user_id', userId)
        .order('issued_at', { ascending: false });

    if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to fetch certificates' });
    }

    res.json(data);
}

export async function getPendingCertificates(req: Request, res: Response) {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    const { data, error } = await supabaseAdmin
        .from('certificates')
        .select(`
            *,
            users (full_name, email),
            courses (title)
        `)
        .eq('status', 'pending')
        .order('issued_at', { ascending: false });

    if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to fetch pending certificates' });
    }

    res.json(data);
}

export async function approveCertificate(req: Request, res: Response) {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;

    // 1. Update status to issued
    const { data: certificate, error } = await supabaseAdmin
        .from('certificates')
        .update({ status: 'issued' })
        .eq('id', id)
        .select(`
            *,
            users (full_name, email),
            courses (title)
        `)
        .single();

    if (error || !certificate) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to approve certificate' });
    }

    // 2. Send email
    const student = (certificate as any).users;
    const course = (certificate as any).courses;
    const fullCertUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}${(certificate as any).certificate_url}`;

    try {
        await sendCertificateEmail(
            student.email,
            student.full_name || 'Student',
            course.title,
            fullCertUrl
        );
    } catch (emailError) {
        console.error('Email sending failed after approval:', emailError);
        // We don't fail the request here as the record is already updated
    }

    res.json({ message: 'Certificate approved and email sent', certificate });
}
