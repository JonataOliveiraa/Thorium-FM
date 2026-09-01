import { Terraria } from './../../../TL/ModImports.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

const { Main } = Terraria;
const WetCollision = Terraria.Collision['bool WetCollision(Vector2 Position, int Width, int Height)'];

export class StormCloudProRain extends ModProjectile {
    static VANILLA_RAIN = 239;

    constructor() {
        super();
        this.Texture = 'Pets/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = 1;
    }

    SetDefaults() {
        this.Projectile.width = 4;
        this.Projectile.height = 30;
        this.Projectile.ignoreWater = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 300;
        this.Projectile.extraUpdates = 1;
        this.Projectile.aiStyle = 45;
        this.AIType = StormCloudProRain.VANILLA_RAIN;
    }

    AI(proj) {
        if (WetCollision(proj.position, proj.width, proj.height)) proj.Kill();
    }

    OnTileCollide(proj, oldVelocity) {
        const player = Main.player[proj.owner];
        const x = (proj.Center.X / 16) | 0;
        const rows = ((proj.height / 16) | 0) + 1;
        const topY = (proj.Top.Y / 16) | 0;

        for (let i = 0; i < rows; i++) {
            player.DoBootsEffect_PlaceFlowersOnTile(x, topY + i);
        }
        return true;
    }

    PreKill(proj, timeLeft) {
        proj.type = StormCloudProRain.VANILLA_RAIN;
        return true;
    }
}
