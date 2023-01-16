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
  room_id?: string,
}

export interface MessageBody{
  message: string
  sender_id: number,
  timestamp: number,
  room_id?: string,
}

export interface Room {
  id: string,
  name: string,
  users?: User[]
  messages?: IMessageItem[]
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
  room_id?: string,
}

export interface IOnlinePayload extends ISocketPayload{
  user_id: number
  connected: boolean
}

