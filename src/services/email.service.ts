import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendCertificateEmail(
    studentEmail: string,
    studentName: string,
    courseName: string,
    certificateUrl: string
) {
    const mailOptions = {
        from: `"LMS Academy" <${process.env.SMTP_USER}>`,
        to: studentEmail,
        subject: `Congratulations! Your Certificate for ${courseName} is Ready`,
        html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Congratulations, ${studentName}!</h2>
        <p>We are thrilled to inform you that you have successfully completed the course: <strong>${courseName}</strong>.</p>
        <p>Your hard work and dedication have paid off. You can view and download your certificate of completion by clicking the link below:</p>
        <p><a href="${certificateUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">View Certificate</a></p>
        <p>Keep learning and growing!</p>
        <br>
        <p>Best regards,<br>The LMS Academy Team</p>
      </div>
    `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Certificate email sent to ${studentEmail}. Message ID: ${info.messageId}`);
    } catch (error) {
        console.error('Error sending certificate email:', error);
        throw new Error('Failed to send certificate email');
    }
}
