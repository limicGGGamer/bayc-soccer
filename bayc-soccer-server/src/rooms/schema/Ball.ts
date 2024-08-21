import { Schema, type } from "@colyseus/schema";

export class Ball extends Schema { 
    @type("string") uId!: string;
    @type("number") posX!: number;
    @type("number") posY!: number;
    @type("number") angle!: number;
    @type("boolean") visible!: boolean;
    
    @type("number") shadowPosX!: number;
    @type("number") shadowPosY!: number;
    @type("number") shadowAngle!: number;
    @type("number") shadowH!: number;
    @type("number") shadowW!: number;
    @type("number") shadowOpacity!: number;

    @type("number") enableTrace!: boolean;

}