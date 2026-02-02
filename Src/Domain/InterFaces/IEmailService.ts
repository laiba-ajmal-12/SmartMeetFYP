export interface IEmailService{
    sendCode(email:string ,code:string ): Promise<boolean>
}