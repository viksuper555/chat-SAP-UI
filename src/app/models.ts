export interface User{
  id?:number
  name?:string
  password?:string
}

export interface IMessageItem{
  id?: number
  userId: number
  senderName?: string
  text?: string
  sentByMe?: boolean
  date?: Date
  dateStr?: string
  roomId?: string
}

export interface MessageBody{
  message: string
  sender_id: number
  timestamp: number
  room_id?: string
}

export interface Room {
  id: string
  name: string
  description?: string
  lastMsgDate?: Date
  users?: User[]
  messages?: IMessageItem[]
  unread: boolean
}

export interface ISocketPayload {
  type: string
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
  type: string
  sender_id: number
  sender_name: string
  timestamp: number
  message: string
  room_id?: string
}

export interface IOnlinePayload extends ISocketPayload{
  user_id: number
  connected: boolean
}
