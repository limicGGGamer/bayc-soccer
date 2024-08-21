import { Room, Client, Delayed, matchMaker, ServerError } from "@colyseus/core";
import { MyRoomState } from "./schema/MyRoomState";
import { userinfo, transferWallet, getGamePass, payGamePass, gameStart } from "../thirdparties/GGGamersApi";
import { syncTicket, userme } from "../thirdparties/DynamodbAPI";

export class MyRoom extends Room<MyRoomState> {
  maxClients = 2;

  public delayedInterval!: Delayed;
  battleRoom:any;

  onCreate (options: any) {
    this.setState(new MyRoomState());

    this.onMessage("type", (client, message) => {
      //
      // handle "type" message
      //
    });
  }

  async onAuth(client: Client, options: any, request: any | Promise<any>) {
    try {
      
      // options.player.sessionId = client.sessionId;
      if (process.env.NODE_ENV !== "production" && options?.debug === true) {
        options.player.isBot = true;
        return true;
      }
      if (!options?.accessToken) {
        throw new Error("Token not exists")
      }

      console.log("onAuth options: ",options);
  
      const payload = await userinfo(options.accessToken);
      options.player.accessToken = options.accessToken;
      options.player.uid = payload?.data?.data?.userId;
      options.player.walletId = payload?.data?.data?.connectedWallets[0].walletAddress;
      options.player.name = payload?.data?.data?.nickname;

      if (!payload) {
        throw new Error("User not found");
      }

      let ticket = null;
      const userInfo = await userme(options?.accessToken);

      console.log("onAuth userme userInfo: ",userInfo);

      const _userInfo = userInfo?.data?.data;
      if(!_userInfo)
        throw new Error("userInfo not exists")

      const currentTime = new Date().getTime();
      const createTime = _userInfo?.ticket?.create_time ? new Date(_userInfo?.ticket?.create_time).getTime() : null;

      if(_userInfo?.ticket_id && _userInfo?.ticket?.state && ["NEW", "gameover"].indexOf(_userInfo?.ticket?.state) === -1 && createTime && currentTime - createTime <= 5 * 60 * 1000) {        
        ticket = _userInfo?.ticket_id;
        return false;
      }
  
      //user no ticket, check the game pass first..
      const gamePassPayload = await getGamePass(options.accessToken);
      console.log("onAuth gamePassPayload: ",gamePassPayload?.data?.data);

      if(gamePassPayload.data.code !== 1)
        throw new Error("Get Game Pass Error.");

      //console.log("gamePassPayload:", gamePassPayload.data);

      //Get unlocked ticket
      (gamePassPayload?.data?.data || []).forEach((_data:any)=>{
        if(!_data.locked)
          ticket = _data.passId;
      });

      if(ticket == null){
        //no ticket, pay to buy a new ticket
        throw new Error("Error: No ticket");      
      }


        //sync-ticket state (NEW)
        const syncTicketData = {
            "userId": options?.player?.uid,
            "ticket_id": ticket as string,
            "state": "NEW",
            "game_id": "ElfinGolf",
            "reconnectToken": this.roomId+":"+ client?._reconnectionToken
        }

        const syncTicketPayload = await syncTicket(options.accessToken, JSON.stringify(syncTicketData));
        if(syncTicketPayload.data.result !== 1)
            throw new Error("Sync Ticket Error.");
        //console.log('Sync Ticket successful:', syncTicketPayload.data);

  

      // redeem ticket
      const gameStartPayload = await gameStart(options.accessToken, ticket);
      //console.log("gameStartPayload:", gameStartPayload.data);
      if(gameStartPayload.data.code !== 1)
        throw new Error("Game Start Error.");      

      (client as any).passCred = gameStartPayload.data?.data?.passCred;
      (client as any).ticket = ticket;

      return true;
    } catch (error: any) {
      console.error(error);
      throw new ServerError(400, "Bad access token");
    }
  }

  onJoin (client: Client, options: any) {
    console.log("queue room on join reconnect token:", this.roomId+":"+ client?._reconnectionToken );

    console.log("onJoin options: ", options);

    const player = this.state.createPlayer(client.sessionId, options?.player, this.state.players.size, options?.player?.uid, "queue", options?.player?.walletId, (client as any)?.ticket, (client as any)?.passCred);
    console.log("this.state.players.size: ",this.state.players.size);

    let canStartGame = this.state.players.size == this.maxClients;

    let players: any = [];
    this.state.players.forEach(player => {
      
      let shortWalletId = player.walletId.substring(0,10);
      let data = {
        id: player.sessionId,
        playerId: player.playerId,
        walletId: shortWalletId
      }
      players.push(data);
    })

    this.broadcast("game-event", {
      event: `set-player`, data: {
        players: players,
        canStartGame: canStartGame
      }
    });
    
    if (this.state.players.size === this.maxClients) {
      this.lock();

      
      this.delayedInterval = this.clock.setInterval(async () => {          //send room length to clients

        const battleRoom = await matchMaker.findOneRoomAvailable("battleRoom", { mode: 'autogame' });          
        
        console.log("have battleRoom: ",battleRoom);
        if (battleRoom) {

          this.battleRoom = battleRoom;


          let players: any = [];
          this.state.players.forEach(async (player) => {
            players[players?.length] = { ...player, player: player };

            const client = this.clients.getById(player.sessionId);
            console.log("player.playerId; ",player.playerId);
            const options = { accessToken:player?.accessToken, sessionId: player?.sessionId, walletId: (player as any)?.walletId, userId:(player as any)?.uid, ticket:player?.ticket, passCred:player?.passCred, playerId: player.playerId };
                          
            if(client){
              client.send("get-my-sessionId", { data: player?.sessionId });       
              const matchData = await matchMaker.reserveSeatFor(this.battleRoom, options);
              client.send("reserveSeatFor", { data: matchData });       
              player.reserveSeat = true;         
            }
          });

          console.log("battle-room-id");
          this.broadcast("battle-room-id", {});
          const payload = await matchMaker.remoteRoomCall(battleRoom.roomId, "setPlayer", [{ roomId: this.roomId, player: players}]);
          if(payload){
            this.broadcast("game-event", {
              state: "game-join",
              message: "Connecting to server"
            });
          }

          this.delayedInterval.clear();
          }          
      }, 2000);

      this.state.waitingForServer = true;
    }
  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

  closeRoom() {
    this.broadcast("game-event", {
      state: "game-joined",
      message: "Connecting to server"
    });
    setTimeout(() => {
      this.disconnect();
    }, 5000);
  }

}
