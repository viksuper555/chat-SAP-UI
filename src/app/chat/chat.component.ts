import {Component, OnDestroy, OnInit} from '@angular/core';
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

import {Apollo, gql, QueryRef} from 'apollo-angular'
import {DataService} from "../data.service";
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {CREATE_ROOM, GET_ROOMS, GET_USERS} from "../../queries";
import {FetchPolicy} from "@apollo/client/core/watchQueryOptions";
import {map, Observable, Subscription} from "rxjs";
import {normalizeSourceMaps} from "@angular-devkit/build-angular/src/utils";
import {EmptyObject} from "apollo-angular/types";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy{
  public message = ''
  public joinCode = ''
  public roomName = ''
  public user!:User;
  public recipients = <string[]>[];
  public onlineUsers = new Set<number>();
  public messageItems = <IMessageItem[]>[];
  public activeRoomId = 0;
  public rooms = <Room[]>[];
  private socketService!:SocketService;

  constructor(
    private apollo: Apollo,
    private httpClient: HttpClient,
    public datepipe: DatePipe,
    public dataService: DataService,
    private router: Router,
  ) {}
  private roomsSubscription!: Subscription;
  private roomsQuery!: QueryRef<any>;

  ngOnInit(){
    if (this.dataService.user)
    {
      this.user = this.dataService.user
      this.onlineUsers = new Set(this.dataService.online_user_ids!)
      this.socketService = this.dataService.socketService

      this.subscribeToRooms();
      this.subscribeToMessages()
    }
    else
    {
      console.error('Login was unsuccessful.')
      this.router.navigate(['/auth'])
    }
  }

  ngOnDestroy(){
    if(!this.socketService)
      return
    this.socketService.close()
    this.roomsSubscription.unsubscribe();
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
                userId: data.sender_id,
                senderName: data.sender_name,
                text: data.message,
                sentByMe: data.sender_id == this.user.id,
                dateStr: this.datepipe.transform(new Date(data.timestamp*1000), 'HH:mm | MMM dd')!,
                roomId: data.room_id,
              }
              let r = this.rooms.find(r => r.id == msg.roomId!)
              if(r){
                r.messages!.push(msg)
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

  async selectRoom(roomId:number){
    this.activeRoomId = roomId;
  }
  async subscribeToRooms(){
    this.roomsQuery = this.apollo.watchQuery<any>({
      query: GET_ROOMS,
      variables: {userId: this.user.id},
      pollInterval: 10000,
      fetchPolicy: "no-cache"
    })

    this.roomsSubscription = this.roomsQuery.valueChanges
      .subscribe(({data, loading}) => {
        var r:Room[] = JSON.parse(JSON.stringify(data.getRooms));
        this.parseRooms(r)
      });
  }
  async refreshRooms(){
    var a = await this.roomsQuery.refetch().then(x => {
      var r:Room[] = JSON.parse(JSON.stringify(x.data.getRooms));
      this.parseRooms(r)
    });
  }
  parseRooms(rooms: Room[]){
    const uMap: Map<number, User> = (new Map(rooms[0].users!.map(x => [x.id!, x])))
    rooms.forEach(r =>{
      let msgCount = r.messages?.length!
      if (msgCount){
        r.lastMsgDate = r.messages![msgCount-1].date
      }
      r.description = this.createMsgDescription(r.users)
      r.messages?.forEach(m=>{
        m.senderName = uMap.get(m.userId)?.name
        m.sentByMe = m.userId == this.user.id
        m.dateStr = this.datepipe.transform(m.date, 'HH:mm | MMM dd') ?? undefined
      })
    })
    rooms = rooms.sort((r1,r2) => {
      if (r1.lastMsgDate! < r2.lastMsgDate!) {
        return 1;
      }

      if (r1.lastMsgDate! > r2.lastMsgDate!) {
        return -1;
      }

      return 0;
    });
    this.activeRoomId = 0
    this.rooms = rooms
  }

  async sendMessage(){
    if (!this.message)
      return
    let msg: MessageBody = {
      message: this.message,
      sender_id: this.user.id ?? 0,
      room_id: this.rooms[this.activeRoomId].id,
      timestamp: Date.now(),
    };
    this.rooms[this.activeRoomId].lastMsgDate = new Date(msg.timestamp)
    this.socketService.send(msg)
    this.message = ''
  }
  async joinRoom(roomId?: string) {
    if(roomId == "")
      return
    this.joinCode = ''
    this.httpClient.post('/api/join', {user_id: this.user.id, room_id: roomId})
      .toPromise().then(() => {
        this.refreshRooms()
    });
  }
  async createRoom(roomName?: string){
    this.roomName = ''
    this.apollo
      .mutate({
        mutation: CREATE_ROOM,
        variables: {
          input: {name: roomName, creatorId: this.user.id},
        }
      })
      .subscribe(
        ({ data, loading }) => {
          // @ts-ignore
          var r:Room = JSON.parse(JSON.stringify(data.createRoom));
          r.description = this.createMsgDescription(r.users)
          r.messages = []
          this.rooms.push(r)
        },
        error => {
          console.log('there was an error sending the query', error)
        }
      )
  }
  async leaveRoom(roomId?: string) {
    if(roomId == "")
      return
    this.httpClient.post<User>('/api/leave', {user_id: this.user.id, room_id: roomId})
      .subscribe(
        next => {
          this.rooms = this.rooms.filter(function( r ) {
              return r.id !== roomId;
            });
          this.activeRoomId = 0;
          },
        error => {
          alert(error.error)
        })
  }
  createLastMsgDate(date:Date | undefined){
    if(!date)
      return ""
    return this.datepipe.transform(date, 'dd MMM') ?? "25 Dec"
  }
  createMsgDescription(users: User[] | undefined){
    return users?.map(a => ` ${a.name}`).toString()
  }
  copyMessage(val: string){
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    alert('Room code copied to clipboard. \n' + "Code: " + val)
  }
}
