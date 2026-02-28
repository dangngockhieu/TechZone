export interface UserPaginate {
  userID: number, 
  name: string, 
  email: string, 
  role: string
}

export interface UserFindEmail {
  id: number,
  name: string,
  email: string,
  password: string,
  role: string,
  refresh_token: string,
  verification_code: string,
  sent_at: Date,
  code_expired: Date,
  isVerified: boolean
}