import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

async function sendWelcomeEmail(from: string, to: string[]) {
    return resend.emails.send({
        from: from,
        to: to,
        subject: 'hello world',
        html: '<strong>it works!</strong>'
    })
}

export default {
    sendWelcomeEmail
}
