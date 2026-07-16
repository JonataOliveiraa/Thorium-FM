import { ScythePro } from '../../Common/Projectiles/ScythePro.js';
import { Terraria, Modules } from '../../TL/ModImports.js';
import { Color } from '../../TL/Modules/Color.js';

const { Vector2 } = Modules;

export class AquaiteScythePro extends ScythePro {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;

        this.dustOffset = Vector2.new(-8, 16);
        this.dustCount = 2;
        this.dustType = 113;
    }

    SetDefaults() {
        super.SetDefaults();

        this.Projectile.width = 100;
        this.Projectile.height = 100;
        this.Projectile.idStaticNPCHitCooldown = 10;
    }

    SpawnDust(proj) {
        const scytheCount = this.scytheCount;
        const dustCount = this.dustCount;
        const dustType = this.dustType;
        const dustCenter = this.DustCenter;

        if (scytheCount <= 0 || dustCount <= 0 || dustType <= -1) return;

        for (let scytheIndex = 0; scytheIndex < scytheCount; scytheIndex++) {
            const angle = (scytheIndex / scytheCount) * Math.PI * 2;
            const rotation = proj.rotation;

            let offset = dustCenter;
            if (proj.spriteDirection < 0) {
                offset = Vector2.new(-offset.X, offset.Y);
            }

            const rotatedOffset = Vector2.RotatedBy(offset, rotation + angle, Vector2.Zero);

            const position = Vector2.Add(
                Vector2.Add(proj.Center, Vector2.new(0, proj.gfxOffY)),
                rotatedOffset
            );

            for (let i = 0; i < dustCount; i++) {
                const dust = Terraria.Dust.NewDustPerfect(
                    position, dustType, Vector2.Zero, 0, Color.White, 1.0
                );
                if (dust) {
                    dust.noGravity = true;
                    dust.noLight = true;
                    dust.scale = 1.2;

                }
            }
        }
    }
}