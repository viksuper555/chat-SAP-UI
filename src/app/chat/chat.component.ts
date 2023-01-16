import { Component } from '@angular/core';
import {DatePipe} from "@angular/common";
import {SocketService} from "../socket.service";
import {
  IErrorPayload,
  IMessageItem,
  IMessagePayload,
  IOnlinePayload,
  ISocketPayload, MessageBody, Room,
  User
} from "../models";
import {DataService} from "../data.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  public message = ''
  public user!:User;
  public recipients = <string[]>[];
  public onlineUsers = new Set<number>();
  public messageItems = <IMessageItem[]>[];
  public activeRoomId = "global";
  public rooms = new Map<string, Room>([
    ["global", {id: "global", name: "Global Room", messages: []}],
    ["vp", {id: "vp", name: "VP Room", messages: []}]
  ]);
  private socketService!:SocketService;

  constructor(
    public datepipe: DatePipe,
    public dataService: DataService,
    private router: Router,
  ) {}

  ngOnInit(){
    if (this.dataService.user)
    {
      this.user = this.dataService.user
      this.onlineUsers = new Set(this.dataService.online_user_ids!)
      this.socketService = this.dataService.socketService
      this.subscribeToMessages()
    }
    else
    {
      console.error('Login was unsuccessful.')
      this.router.navigate(['auth'])
    }
  }

  ngOnDestroy(){
    this.socketService.close()
  }

  async subscribeToMessages(){
    this.socketService.getEventListener()
      .subscribe((value:{ type: string, data: object }) => {
        if (value.type == 'message'){
          switch ((value.data as ISocketPayload).type){
            case 'message':
            {
              var data = (value.data as IMessagePayload)
              let msg: IMessageItem = {
                sender_id: data.sender_id,
                sender_name: data.sender_name,
                message: data.message,
                sentByMe: data.sender_id == this.user.id,
                dateStr: this.datepipe.transform(new Date(data.timestamp*1000), 'HH:mm | MMM dd')!,
                room_id: data.room_id,
              }
              if(this.rooms.get(msg.room_id!)){
                this.rooms.get(msg.room_id!)!.messages!.push(msg)
              }
              document.getElementById('send-Input')!.scrollIntoView({behavior: 'smooth'});
              break;
            }
            case 'online':
            {
              let user_id = (value.data as IOnlinePayload).user_id;
              if(user_id != this.user.id)
              if ((value.data as IOnlinePayload).connected)
                this.onlineUsers.add(user_id)
              else
                this.onlineUsers.delete(user_id)
              break;
            }
            case 'error':
            {
              this.socketService.close()
              this.router.navigate(['auth'])
              alert((value.data as IErrorPayload).message)
              break;
            }
          }
        }
        else
          console.log(value)
      });
  }

  async selectRoom(roomId:string){
    this.activeRoomId = roomId;
  }

  async sendMessage(){
    if (!this.message)
      return
    let msg: MessageBody = {
      message: this.message,
      sender_id: this.user.id ?? 0,
      room_id: this.activeRoomId,
      timestamp: Date.now(),
    };
    this.socketService.send(msg)
    this.message = ''
  }

}
