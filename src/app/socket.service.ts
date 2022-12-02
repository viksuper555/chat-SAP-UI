import { Injectable } from "@angular/core";
import { EventEmitter } from "@angular/core";
import {MessageBody, User} from "./models";

@Injectable({
  providedIn: "root"
})
export class SocketService {
  private socket!: WebSocket;
  private listener?: EventEmitter<any>;
  private loginId?: string
  public constructor() {}

  public initialize(loginId:string){
    this.listener = new EventEmitter();
    this.loginId = loginId
    this.socket = new WebSocket("ws://localhost:9000/ws");
    this.socket.onopen = event => {
      console.log('Socket open')
      this.listener!.emit({ type: "open", data: event});
      let rb:User = {uuid: loginId}
      this.socket.send(JSON.stringify(rb));
    };
    this.socket.onclose = event => {
      console.log('Socket closing')
      this.listener!.emit({ type: "close", data: event });
      this.close()
    };
    this.socket.onmessage = event => {
      this.listener!.emit({ type: "message", data: JSON.parse(event.data) });
    };
  }

  public send(data: MessageBody) {
    this.socket.send(JSON.stringify(data));
  }

  public close() {
    this.socket.close();
    this.listener!.complete();
  }

  public getEventListener() {
    return this.listener!;
  }
}
