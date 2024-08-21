import { Schema, type } from "@colyseus/schema";

export class Player extends Schema {
    public connected: boolean;
    public sessionId: string;
    public accessToken: string;
    public options: any;
    
    @type("number") posX!: number;
    @type("number") posY!: number;
    @type("number") posz!: number;
    @type("number") playerId!: number;
    @type("string") state: string;
    @type("string") userId: string;
    @type("string") walletId: string;    
    @type("string") ticket: string;    
    @type("string") passCred: string;    
    @type("boolean") reserveSeat: boolean;
}