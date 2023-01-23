import {Component, EventEmitter, Input, Output} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {SocketService} from "../socket.service";
import {DatePipe} from "@angular/common";
import {ActivatedRoute, Router} from "@angular/router";
import {FormControl, FormGroup, NgForm} from "@angular/forms";
import {User, ISocketPayload, IErrorPayload, ILoginData} from "../models";
import {DataService} from "../data.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-authorization',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})


export class AuthComponent {
  private subscription?: Subscription;
  public ShowLogin = false;
  public User:User = {};
  public OnlineUserIds?: number[];

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
    this.dataService.user = this.User;
    this.dataService.online_user_ids = this.OnlineUserIds;
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
      name: form.value.name,
      password: form.value.password
    }
    this.httpClient.post<User>('/api/register', {user:u})
      .subscribe(
        next => {
          this.User.name = next?.name || ""
          this.User.password = next?.password || ""
          alert("Successfully registered.")
        },
        error => {
          alert(error.error)
        })
  }

  async login(form: NgForm){
    if (!form.value.name || !form.value.password )
    {
      alert('Please enter credentials.')
      return
    }
    this.User.name = form.value.name
    this.User.password = form.value.password

    this.socketService.initialize(this.User)
    this.subscription = this.socketService.getEventListener()
      .subscribe(async (value: { type: string, data: ISocketPayload }) => {
        if (value.type == 'message') {
          switch (value.data.type) {
            case 'login': {
              this.User = (value.data as ILoginData).user
              this.OnlineUserIds = (value.data as ILoginData).online_user_ids
              await this.router.navigate(['chat']);
              break;
            }
            case 'error': {
              this.socketService.close()
              window.location.reload();
              alert((value.data as IErrorPayload).message)
              break;
            }
          }
        }
      });
  }

  toggleLogin(){
    this.ShowLogin = !this.ShowLogin
  }
}
