import { JwtService } from "@nestjs/jwt";
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketServer } from "@nestjs/websockets";
import { Server } from 'ws';
import { Logger } from "@nestjs/common";
import { Socket } from "socket.io";
import { ConfigService } from "../../config/config.service";
import { UserService } from "../../modules/user/user.service";

export class SocketBaseClass implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    protected readonly jwtService: JwtService,
    protected readonly configService: ConfigService,
    protected readonly userService: UserService,
  ) { }

  public logger: Logger = new Logger('MessageGateway');
  @WebSocketServer() server: Server;

  public afterInit(server: Server): void {
    return this.logger.log('Init');
  }

  public async handleConnection(client: Socket): Promise<void> {
    let user
    try {
      const token = client.request._query.auth_token
      if (!token) {
        client.disconnect();
        return this.logger.error(`***onConnection*** error: Dont have authen.`);
      } else {
        const decoded = await this.jwtService.verify(token, { secret: this.configService.jwtConfig.secret }) as any;
        user = await this.userService.getUserInfoRedis(decoded.id);
        client['user'] = user; // add userInfo to socket
        client['userId'] = decoded.id;

        // TODO: binding function onRoomChange run after connection, if cant set, using client.emit('connectSuccess')
        client.emit('connectSuccess', { result: true }) // client emit('joinRoom') on that event
      }
    } catch (e) {
      client.disconnect();
      return this.logger.error(`***onConnection*** exception: ${e}`);
    }
    return this.logger.log(`===onConnection=== userId: ${user.id} Client connected: ${client.id}`);
  }

  public handleDisconnect(client: Socket): void {
    if (!client['user']) return

    const user = client['user'];
    if (parseInt(user.id) === parseInt(client['currentRoomId'])) {
      // TODO: update all record in room_members
      // emit('liveEnd') for user in room => client todo leave room or
      console.log('Host quit')
    } else {
      // TODO: update all record in room_members
      // emit('liveStats') for user in room
      console.log('User quit')
    }

    return this.logger.log(`===onDisconnect=== userId=${user ? user.id : null} disconnected.`);
  }

}