import { type CreateEmailResponse, Resend } from 'resend'
import { type DBUser } from '../definitions/types.ts'

const resend = new Resend(process.env.RESEND_API_KEY)

async function sendWelcomeEmail(sender: string, recipient: DBUser): Promise<CreateEmailResponse> {
    return resend.emails.send({
        from: sender,
        to: recipient.email,
        template: {
            id: 'welcome-email',
            variables: {
                username: recipient.username,
                dashboard_url: String(process.env.ORIGIN) + '/auth/iniciar-sesion'
            }
        }
    })
}

async function sendChangedPasswordEmail(sender: string, recipient: DBUser): Promise<CreateEmailResponse> {
    return resend.emails.send({
        from: sender,
        to: recipient.email,
        template: {
            id: 'changed-password-email',
            variables: {
                username: recipient.username,
                dashboard_url: String(process.env.ORIGIN) + '/auth/iniciar-sesion'
            }
        }
    })
}

async function sendResetPasswordEmail(sender: string, recipient: DBUser, token: string): Promise<CreateEmailResponse> {
    return resend.emails.send({
        from: sender,
        to: recipient.email,
        template: {
            id: 'reset-password-email',
            variables: {
                username: recipient.username,
                reset_password_url: String(process.env.ORIGIN) + '/recuperar-contraseña/' + token
            }
        }
    })
}

export default {
    sendWelcomeEmail,
    sendChangedPasswordEmail,
    sendResetPasswordEmail
}
