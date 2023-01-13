import { Injectable } from "@angular/core";
import { EventEmitter } from "@angular/core";
import {MessageBody, User} from "./models";
import {Router} from "@angular/router";

@Injectable({
  providedIn: "root"
})
export class SocketService {
  private socket!: WebSocket;
  private listener!: EventEmitter<any>;
  private loginId?: string
  public constructor(
    private router: Router,
  ) {}

  public initialize(u:User){
    this.listener = new EventEmitter();
    this.loginId = u.password //TODO: Delete this
    this.socket = new WebSocket("ws://localhost:8080/ws");
    this.socket.onopen = event => {
      console.log('Socket open')
      this.listener.emit({ type: "open", data: event});
      this.socket.send(JSON.stringify({user:u}));
    };
    this.socket.onclose = event => {
      console.log('Socket closing')
      this.listener.emit({ type: "close", data: event });
      this.close()
      this.router.navigate(['auth'])
    };
    this.socket.onmessage = event => {
      console.log('Message: ', JSON.parse(event.data))
      this.listener.emit({ type: "message", data: JSON.parse(event.data) });
    };
  }

  public send(data: MessageBody) {
    this.socket.send(JSON.stringify(data));
  }

  public close() {
    this.socket.close();
    this.listener.complete();
  }

  public getEventListener() {
    return this.listener;
  }
}
