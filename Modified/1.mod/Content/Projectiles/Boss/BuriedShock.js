import { ModProjectile } from "../../../TL/ModProjectile.js";

export class BuriedShock extends ModProjectile {
  constructor() {
    super();
    this.Texture = "Projectiles/ChampionShock";
  }

  SetDefaults() {
    const p = this.Projectile;
    p.width = 42;
    p.height = 42;
    p.aiStyle = 1;
    p.hostile = true;
    p.penetrate = -1;
    p.timeLeft = 120;
    p.tileCollide = false;
  }
}
