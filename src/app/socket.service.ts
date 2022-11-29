import { Injectable } from "@angular/core";
import { EventEmitter } from "@angular/core";
import {MessageBody, RegisterBody} from "./app.component";

@Injectable({
  providedIn: "root"
})
export class SocketService {
  private socket!: WebSocket;
  private listener: EventEmitter<any> = new EventEmitter();
  private username?: string
  public constructor() {}

  public initialize(username:string){
    this.username = username
    this.socket = new WebSocket("ws://localhost:9000/ws");
    this.socket.onopen = event => {
      this.listener.emit({ type: "open", data: event});
      let rb:RegisterBody = {username: username}
      this.socket.send(JSON.stringify(rb));
    };
    this.socket.onclose = event => {
      this.listener.emit({ type: "close", data: event });
    };
    this.socket.onmessage = event => {
      this.listener.emit({ type: "message", data: JSON.parse(event.data) });
    };

    return true;
  }

  public send(data: MessageBody) {
    this.socket.send(JSON.stringify(data));
  }

  public close() {
    this.socket.close();
  }

  public getEventListener() {
    return this.listener;
  }
}
