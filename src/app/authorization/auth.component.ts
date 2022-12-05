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
  public user:User = {uuid:'ffa5302b-cc5f-4c60-803f-6e94d9c5335d'};
  private subscription?: Subscription;
  public registerUserId?:string;

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
    this.user.username = form.value.username
    var body: User = {
      username: this.user!.username
    }
    this.httpClient.post<User>('/api/register', body)
      .subscribe(
        next => {
          this.registerUserId = next?.uuid
          this.user.uuid = next?.uuid || ""
          alert("Successfully registered.")
        },
        error => {
          alert(error.error)
        })
  }

  async login(){
    if (!this.user?.uuid)
      alert('Please enter login token.')
    this.socketService.initialize(this.user.uuid!)
    this.subscription = this.socketService.getEventListener()
      .subscribe(async (value: { type: string, data: object }) => {
        if (value.type == 'message') {
          let data = JSON.parse(value.data.toString())
          console.log(data)

          switch (data.type) {
            case 'login': {
              this.user.username = data.username
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
