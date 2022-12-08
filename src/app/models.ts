export interface User{
  id?:string
  name?:string,
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
