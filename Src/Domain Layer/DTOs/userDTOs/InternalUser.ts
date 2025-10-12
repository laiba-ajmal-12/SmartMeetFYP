export interface InternalUserDTO {
  id:number
  name: string
  email: string
  passwordHash: string
  ImagePath?: string
  accountType: string
  ActiveCode?: string
  ActiveCodeTime?: Date
  active?: boolean
  createdAt?: Date
}