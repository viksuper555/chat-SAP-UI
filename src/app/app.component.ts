import { Component } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {lastValueFrom} from "rxjs";
import {SocketService} from "./socket.service";

export interface IMessageItem{
  user: string
  message: string
}

export interface MessageBody{
  sender_id: string
  message: string
  recipients: string[]
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  subscription: any;
  public message = ''
  public myId = 'Viktor'
  public recipients: string[] | undefined
  public messageItems: IMessageItem[] = [{
    user: 'Ivan',
    message: 'Zdrasti'
  },
  {
    user: 'Georgi',
    message: 'Zdr!'
  }
  ]
  constructor(
    private httpClient: HttpClient,
    private socketService:SocketService
  ) {}

  ngOnInit() {
    this.loadMessages()
  }

  async loadMessages(){
    this.socketService.getEventListener()
      .subscribe(function (data: JSON) {
      console.log('First subscriber: ' + JSON.stringify(data));
    });
    // const messageItems$ = this.httpClient.get<IMessageItem[]>('/api/messages');
    // this.messageItems = await lastValueFrom(messageItems$)
  }
  async sendMessage(){
    var msg: MessageBody = {
      sender_id: this.myId,
      message: this.message,
      recipients: [this.myId],
    }
    this.socketService.send(msg)
  }

}
