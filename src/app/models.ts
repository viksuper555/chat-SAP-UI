export interface User{
  uuid?:string
  username?:string,
}

export interface IMessageItem{
  user: string
  message: string
  sentByMe: boolean
  dateStr?: string
}

export interface MessageBody{
  message: string
  recipients?: string[]
}
