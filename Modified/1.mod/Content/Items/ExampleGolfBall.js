import { Terraria } from './../../TL/ModImports.js';
import { ModItem } from './../../TL/ModItem.js';
import { ModProjectile } from './../../TL/ModProjectile.js';

export class ExampleGolfBall extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/' + this.constructor.name;
    }
    
    SetDefaults() {
        this.DefaultToGolfBall(ModProjectile.getTypeByName('ExampleGolfBallProjectile'));
    }
}