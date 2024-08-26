"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyRoomState = void 0;
const schema_1 = require("@colyseus/schema");
const Player_1 = require("./Player");
const Ball_1 = require("./Ball");
class MyRoomState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.waitingForServer = false;
        this.players = new schema_1.MapSchema();
        this.balls = new schema_1.MapSchema();
    }
    createPlayer(sessionId, props, playerId, userId, state, walletId, ticket, passCred) {
        console.log('createPlayer sessionId :', sessionId, '    playerId; ', playerId, '    walletId: ', walletId ? walletId : "");
        //console.log('props :', props);
        const player = new Player_1.Player().assign(props?.data || props);
        player.posX = -9999;
        player.posY = -9999;
        player.posz = 0;
        player.reserveSeat = false;
        player.userId = userId;
        player.state = state;
        player.walletId = walletId ? walletId : "";
        player.ticket = ticket;
        player.passCred = passCred;
        player.sessionId = sessionId;
        player.playerId = playerId;
        this.players.set(sessionId, player);
        return player;
    }
    createBall(uId) {
        console.log('createBall ');
        const ball = new Ball_1.Ball();
        ball.uId = uId;
        ball.posX = 0;
        ball.posY = 0;
        this.balls.set(uId, ball);
    }
}
exports.MyRoomState = MyRoomState;
__decorate([
    (0, schema_1.type)("boolean")
], MyRoomState.prototype, "waitingForServer", void 0);
__decorate([
    (0, schema_1.type)({ map: Player_1.Player })
], MyRoomState.prototype, "players", void 0);
__decorate([
    (0, schema_1.type)({ map: Ball_1.Ball })
], MyRoomState.prototype, "balls", void 0);
