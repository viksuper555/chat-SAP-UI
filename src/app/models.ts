export interface User{
  id?:number,
  username?:string,
  password?:string
}

export interface IMessageItem{
  sender_id: number
  sender_name: string
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

export interface ILoginData extends ISocketPayload{
  user: User
  online_user_ids: number[]
}

export interface IMessagePayload extends ISocketPayload{
  type: string,
  sender_id: number,
  sender_name: string,
  timestamp: number,
  message: string,
  recipients: number[]
}

export interface IOnlinePayload extends ISocketPayload{
  user_id: number
  connected: boolean
}
