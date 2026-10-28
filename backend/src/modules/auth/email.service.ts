import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const emailFrom = process.env.EMAIL_FROM;

if (!smtpHost || !smtpUser || !smtpPass || !emailFrom) {
    throw new Error("Missing SMTP configuration.");
}

if (smtpPort !== 587) {
    throw new Error("SMTP_PORT must be 587.");
}

const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    auth:{
        user: smtpUser,
        pass: smtpPass
    }
});

export async function send_email(email: string, code: string): Promise<void>
{
    await transporter.sendMail({
        from: emailFrom,
        to: email,
        subject: "Verify your email - ft_transcendence",
        text:
            `Your verification code is: ${code}\n\n` +
            "This code expires in 10 minutes.\n\n"
    });
}
