import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModHag } from '../../../Common/ModHag.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';

const { Vector2 } = Modules;
const { Main } = Terraria;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;
const { ItemDropRule, Conditions } = Terraria.GameContent.ItemDropRules;
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class GreenHag extends ModHag {
    constructor() {
        super();
        this.Texture = 'NPCs/Hag/' + this.constructor.name;
        this.TeleportDust = 157;
        this.AttackDust = 44;
        this.DeathDustAlpha = 0;
        this.AttackSound = Terraria.ID.SoundID.Item43;
        this.LightR = 0.1;
        this.LightG = 0.3;
        this.LightB = 0.1;
        this._proType = -1;
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.UndergroundJungle);
        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate('Bestiary.GreenHag');
        bestiaryEntry.Info.Add(FlavorText);
    }

    SpawnChance(info) {
        if (!info.CommonEnemy || info.PlayerSafe || !info.BelowSurface) return 0;
        if (!Terraria.NPC.downedBoss2 || info.SpawnTileType !== 60) return 0;
        return 0.0035;
    }

    HagShoot(npc, player) {
        if (this._proType === -1) this._proType = ModProjectile.getTypeByName('GreenHagPro1') ?? -2;
        if (this._proType <= 0) return;

        const target = player.Center;
        for (let i = 0; i < 2; i++) {
            const side = i === 0 ? 1 : -1;
            NewProjectile(
                null,
                Vector2.new(target.X + side * 50, target.Y + 20),
                Vector2.new(0, -5.5),
                this._proType, 25, 0, Main.myPlayer, 0, 0, 0, null
            );
        }
    }

    ModifyNPCLoot(npcLoot) {
        const notExpert = Conditions.NotExpert ? Conditions.NotExpert.new() : null;
        const isExpert = Conditions.IsExpert ? Conditions.IsExpert.new() : null;

        {
            if (notExpert && isExpert) {
                npcLoot.Add(ItemDropRule.ByCondition(notExpert, 331, 1, 1, 3, 1));
                npcLoot.Add(ItemDropRule.ByCondition(isExpert, 331, 1, 2, 6, 1));
            } else {
                npcLoot.Add(ItemDropRule.Common(331, 1, 1, 3));
            }
        }
        {
            if (notExpert && isExpert) {
                npcLoot.Add(ItemDropRule.ByCondition(notExpert, 209, 3, 1, 1, 1));
                npcLoot.Add(ItemDropRule.ByCondition(isExpert, 209, 3, 1, 2, 1));
            } else {
                npcLoot.Add(ItemDropRule.Common(209, 3, 1, 1));
            }
        }
    }
}
