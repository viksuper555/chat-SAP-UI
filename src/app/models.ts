export interface User{
  id?:number,
  username?:string,
  password?:string
}

export interface IMessageItem{
  user: string
  message: string
  sentByMe: boolean
  dateStr?: string,
  hub_id?: string,
}

export interface MessageBody{
  message: string
  recipients?: string[]
}

export interface ISocketPayload {
  type: string,
  data: object
}

export interface IErrorPayload extends ISocketPayload{
  message: string
}

export interface IUserPayload extends ISocketPayload{
  user: User
}

export interface IMessagePayload extends ISocketPayload{
  id: number,
  type: string,
  sender_name: string,
  timestamp: number,
  message: string,
  recipients: number[]
}

export interface IOnlinePayload extends ISocketPayload{
  users: string[]
}
