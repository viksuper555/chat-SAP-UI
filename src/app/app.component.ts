import { Component } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {SocketService} from "./socket.service";

export interface IMessageItem{
  user: string
  message: string
}

export interface MessageBody{
  message: string
  recipients: string[]
}

export interface RegisterBody{
  uuid?: string
  username: string
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  subscription: any;
  public message = ''
  public username = 'Viktor'
  public uuid = ''
  public myId = 'Viktor'
  public connected = false;
  public recipients = <string[]>[];
  public onlineUsers = <string[]>[];
  public messageItems = <IMessageItem[]>[];

  constructor(
    private httpClient: HttpClient,
    private socketService:SocketService
  ) {}

  // ngOnInit() {
  //   this.loadMessages()
  // }

  async loadMessages(){
    this.socketService.getEventListener()
      .subscribe((value:{ type: string, data: object }) => {
        if (value.type == 'message'){
          let data = JSON.parse(value.data.toString())
          console.log(data)

          switch (data.type){
            case 'message':
            {
              let msg: IMessageItem = {
                user: data.sender_id,
                message: data.message
              }
              this.messageItems.push(msg)
              break;
            }
            case 'online':
            {
              this.onlineUsers = data.users
              break;
            }

          }
        }
        else
          console.log(value)
    });
    // const messageItems$ = this.httpClient.get<IMessageItem[]>('/api/messages');
    // this.messageItems = await lastValueFrom(messageItems$)
  }
  async sendMessage(){
    var msg: MessageBody = {
      message: this.message,
      recipients: [this.myId],
    }
    this.socketService.send(msg)
  }

  async register(){
    var body: RegisterBody = {
      username: this.username
    }
    this.httpClient.post<RegisterBody>('/api/register', body)
      .subscribe(
        next => {
          console.log(next)
          this.uuid = next?.uuid || ""
          alert("Successfully registered.")
        },
        error => {
            alert(error.error)
        })
  }

  async login(){
    this.connected = this.socketService.initialize(this.username)
    await this.loadMessages()
  }

}
