import { Component } from '@angular/core';
import {DatePipe} from "@angular/common";
import {SocketService} from "../socket.service";
import {
  IErrorPayload,
  IMessageItem,
  IMessagePayload,
  IOnlinePayload,
  ISocketPayload,
  MessageBody,
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
  public onlineUsers = <string[]>[];
  public messageItems = <IMessageItem[]>[];
  //region MI
  // public messageItems:IMessageItem[] = [{
  //   user: "Viktor",
  //   message: "asdgfasdgasdfasdfasdfasdfaasdgfasdgasdfasdfasdfasdfasdfsadfsdfsaasdgfasdgasdfasdfasdfasdfasdfsadfdf",
  //   sentByMe: true
  // },{
  //   user: "Ivan",
  //   message: "asdgfasdgasdfasdfasdfasdfaasdgfasdgasdfasdfasdfasdfasdfsadfsdfsaasdgfasdgasdfasdfasdfasdfasdfsadfdf",
  //   sentByMe: false
  // }]
  //endregion
  public activeRoom = "Global Room";
  public rooms = ["Global Room", "VP Room"]
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
      this.socketService = this.dataService.socketService
      this.subscribeToMessages()
    }
    else
    {
      console.error('Login was unsuccessful.')
      this.router.navigate(['auth'])
    }
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
                user: data.sender_name,
                message: data.message,
                sentByMe: data.sender_name == this.user.username,
                dateStr: this.datepipe.transform(new Date(data.timestamp*1000), 'HH:MM | MMM dd')!,
                hub_id: 'test',
              }
              this.messageItems.push(msg)
              document.getElementById('send-Input')!.scrollIntoView({behavior: 'smooth'});
              break;
            }
            case 'online':
            {
              var users = (value.data as IOnlinePayload).users
              this.onlineUsers = users.filter((obj: string | undefined) => {return obj !== this.user.username})
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

  async sendMessage(){
    let msg: MessageBody = {
      message: this.message
    };
    this.socketService.send(msg)
    this.message = ''
  }

}
