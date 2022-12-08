import {Component, EventEmitter, Input, Output} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {SocketService} from "../socket.service";
import {DatePipe} from "@angular/common";
import {ActivatedRoute, Router} from "@angular/router";
import {FormControl, FormGroup, NgForm} from "@angular/forms";
import {IMessageItem, User} from "../models";
import {DataService} from "../data.service";
import {Subscription} from "rxjs";

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
    this.user.name = form.value.username
    var u: User = {
      name: this.user!.name
    }
    this.httpClient.post<User>('/api/register', {user:u})
      .subscribe(
        next => {
          this.user.id = next?.id || ""
          this.user.name = next?.name || ""
          alert("Successfully registered.")
        },
        error => {
          alert(error.error)
        })
  }

  async login(form: NgForm){
    if (!form.value.uuid || !form.value.username)
    {
      alert('Please enter credentials.')
      return
    }
    this.user.id = form.value.uuid
    this.user.name = form.value.username

    this.socketService.initialize(this.user)
    this.subscription = this.socketService.getEventListener()
      .subscribe(async (value: { type: string, data: object }) => {
        if (value.type == 'message') {
          let data = JSON.parse(value.data.toString())
          console.log(data)

          switch (data.type) {
            case 'login': {
              this.user = data.user
              await this.router.navigate(['chat']);
              break;
            }
            case 'error': {
              this.socketService.close()
              window.location.reload();
              alert(data.message)
              break;
            }
          }
        } else
          console.log(value)
      });
  }
}
