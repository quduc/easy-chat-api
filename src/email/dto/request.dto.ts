export class SendEmailDto {
  to: string
  from: string
  subject: string
  template?: string
  context?: {}
  html?: string
}