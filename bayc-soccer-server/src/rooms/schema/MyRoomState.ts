
import { Schema, type, MapSchema } from "@colyseus/schema";
import { Player } from "./Player";
import { Ball } from "./Ball";

export class MyRoomState extends Schema {

  @type("boolean") waitingForServer = false;
  @type({ map: Player }) players = new MapSchema<Player>();
  @type({ map: Ball }) balls = new MapSchema<Ball>();

  createPlayer(sessionId: string, props: any, playerId:any, userId:string, state: string, walletId: string, ticket:string, passCred:string) {
    console.log('createPlayer sessionId :', sessionId, '    playerId; ',playerId);
    //console.log('props :', props);
    const player = new Player().assign(props?.data || props);
    player.posX = -9999;
    player.posY = -9999;
    player.posz = 0;

    player.reserveSeat = false;
    player.userId = userId;
    player.state = state;
    player.walletId = walletId;
    player.ticket = ticket;
    player.passCred = passCred;
    player.sessionId = sessionId;
    player.playerId = playerId;
    this.players.set(sessionId, player);
    return player;
  }

  createBall(uId:string){
    console.log('createBall ');
    const ball = new Ball();
    ball.uId = uId;
    ball.posX = 0;
    ball.posY = 0;
    this.balls.set(uId, ball);
  }
}
