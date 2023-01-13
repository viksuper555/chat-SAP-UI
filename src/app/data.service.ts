import {User} from "./models";
import {SocketService} from "./socket.service";

export class DataService {
  public user?: User;
  public online_user_ids?: number[];
  public socketService!: SocketService
}
