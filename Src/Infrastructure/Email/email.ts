import type { IEmailService } from "../../Domain/InterFaces/IEmailService.js";
import { TransactionalEmailsApi, SendSmtpEmail } from "@getbrevo/brevo";

export class BrevoEmail implements IEmailService {
    private transactionalApi: TransactionalEmailsApi;
    private senderemail :string

    constructor(email:string) {
        this.transactionalApi = new TransactionalEmailsApi();
        (this.transactionalApi as any).authentications["apiKey"].apiKey = process.env.BREVO_API_KEY!;
        this.senderemail = email; 
    }

    async sendCode(email: string, code: string): Promise<boolean> {
        const msg = new SendSmtpEmail();
        msg.sender = { name: "SmartMeet", email: this.senderemail };
        msg.to = [{ email }];
        msg.subject = "Your Login Code";
        msg.htmlContent = `<p>Your login code is: <strong>${code}</strong></p>`;
        msg.textContent = `Your login code is: ${code}`;

        try {
            await this.transactionalApi.sendTransacEmail(msg);
            console.log("Login code sent successfully via Brevo!");
            return true;
        } catch (error: any) {
            console.error("Error sending login code via Brevo:", error);
            return false;
        }
    }
}
