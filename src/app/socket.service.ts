import { Injectable } from "@angular/core";
import { EventEmitter } from "@angular/core";
import { MessageBody } from "./app.component";

@Injectable({
  providedIn: "root"
})
export class SocketService {
  private socket: WebSocket;
  private listener: EventEmitter<any> = new EventEmitter();

  public constructor() {

    this.socket = new WebSocket("ws://localhost:9000/ws");
    this.socket.onopen = event => {
      this.listener.emit({ type: "open", data: event });
    };
    this.socket.onclose = event => {
      this.listener.emit({ type: "close", data: event });
    };
    this.socket.onmessage = event => {
      this.listener.emit({ type: "message", data: JSON.parse(event.data) });
    };
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
