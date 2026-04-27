import { ModProjectile } from '../../TL/ModProjectile.js';
import { Color } from '../../TL/Modules/Color.js';
import { Rand } from '../../TL/Modules/Rand.js';
import { Vector2 } from '../../TL/Modules/Vector2.js';
import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModPlayer } from './../../TL/ModPlayer.js';

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class gPlayer extends ModPlayer {
    constructor() {
        super();
    }

    //Armor, Accessories, etc.
    LifeRecoveryBuffDelayTime = 0
    LavaHugBuffDelayTime = 0

    LivingWoodAcornArmorBuff = true
    IncubatedEggBuff = true

    IcyArmorBuff = true
    IcyArmorPro = false

    OnEnterWorld(player) {
    }
    
    ResetEffects(player) {
        this.IncubatedEggBuff = false
        this.LivingWoodAcornArmorBuff = false;
        this.IcyArmorBuff = false
    }
    
    UpdateEquips(player) {
    }

    OnHitNPCWithProj(player, npc, projectile) {
        if(this.IncubatedEggBuff) {
            if (projectile.minion || Terraria.ID.ProjectileID.Sets.MinionShot[projectile.type]) {
                if(Math.random() < 0.1) return;

                const eggType = ModProjectile.getTypeByName('IncubatedSpider');
                const position = npc.Center;
                const velocity = Vector2.new(0, -2);
                const damage = projectile.damage;
                const knockBack = projectile.knockBack;
                const owner = player.whoAmI;
                const source = projectile.GetProjectileSource_FromThis()
                
                NewProjectile(source, position, velocity, eggType, damage, knockBack, owner, 0, 0, 0, null);
                NewProjectile(source, position, velocity, eggType, damage, knockBack, owner, 0, 0, 0, null);
            }
        }
    }
}