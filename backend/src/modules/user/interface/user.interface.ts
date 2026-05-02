import { Role } from "../../../enums"

export interface UserPaginate {
  userID: number,
  name: string,
  email: string,
  role: Role
}

export interface UserFindEmail {
  id: number,
  name: string,
  email: string,
  password: string,
  role: Role,
  refresh_token: string,
  verification_code: string,
  sent_at: Date,
  code_expired: Date,
  isVerified: boolean
}