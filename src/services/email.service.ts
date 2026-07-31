import { CreateEmailResponse, Resend } from 'resend'
import { DBUser } from '../definitions/types'

const resend = new Resend(process.env.RESEND_API_KEY)

async function sendWelcomeEmail(sender: string, recipient: DBUser): Promise<CreateEmailResponse> {
    return resend.emails.send({
        from: sender,
        to: recipient.email,
        template: {
            id: 'welcome-email',
            variables: {
                username: recipient.username,
                dashboard_url: 'http://localhost:2409/home'
            }
        }
    })
}

export default {
    sendWelcomeEmail
}
