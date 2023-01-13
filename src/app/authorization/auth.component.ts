import {Component, EventEmitter, Input, Output} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {SocketService} from "../socket.service";
import {DatePipe} from "@angular/common";
import {ActivatedRoute, Router} from "@angular/router";
import {FormControl, FormGroup, NgForm} from "@angular/forms";
import {User, ISocketPayload, MessageBody, IErrorPayload, IUserPayload} from "../models";
import {DataService} from "../data.service";
import {Subscription} from "rxjs";
import { Buffer } from 'buffer';

@Component({
  selector: 'app-authorization',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})


export class AuthComponent {
  public user:User = {};
  private subscription?: Subscription;

  constructor(
    private httpClient: HttpClient,
    private socketService:SocketService,
    public datepipe: DatePipe,
    public dataService: DataService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnDestroy() {
    this.subscription?.unsubscribe()
    this.dataService.user = this.user;
    this.dataService.socketService = this.socketService;
  }

  form: FormGroup = new FormGroup({
    password: new FormControl(''),
  });

  submit() {
    if (this.form.valid) {
      this.submitEM.emit(this.form.value);
    }
  }
  @Input() error: string | null | undefined;

  @Output() submitEM = new EventEmitter();

  async register(form: NgForm){
    var u: User = {
      username: form.value.username,
      password: form.value.password
    }
    this.httpClient.post<User>('/api/register', {user:u})
      .subscribe(
        next => {
          this.user.username = next?.username || ""
          this.user.password = next?.password || ""
          alert("Successfully registered.")
        },
        error => {
          alert(error.error)
        })
  }

  async login(form: NgForm){
    if (!form.value.username || !form.value.password )
    {
      alert('Please enter credentials.')
      return
    }
    this.user.username = form.value.username
    this.user.password = form.value.password

    this.socketService.initialize(this.user)
    this.subscription = this.socketService.getEventListener()
      .subscribe(async (value: { type: string, data: string }) => {
        if (value.type == 'message') {
          const jsonString = Buffer.from(value.data,'base64').toString()
          var payload :ISocketPayload = JSON.parse(jsonString)
          switch (payload.type) {
            case 'login': {
              this.user = (payload as IUserPayload).user
              await this.router.navigate(['chat']);
              break;
            }
            case 'error': {
              this.socketService.close()
              window.location.reload();
              alert((payload as IErrorPayload).message)
              break;
            }
          }
        } else
          console.log(value)
      });
  }
}
