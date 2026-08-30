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

export class CyanHag extends ModHag {
    constructor() {
        super();
        this.Texture = 'NPCs/Hag/' + this.constructor.name;
        this.TeleportDust = 176;
        this.AttackDust = 111;
        this.DeathDustAlpha = 125;
        this.AttackSound = Terraria.ID.SoundID.Item45;
        this.LightR = 0.1;
        this.LightG = 0.2;
        this.LightB = 0.2;
        this._proType = -1;
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Sky);
        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate('Bestiary.CyanHag');
        bestiaryEntry.Info.Add(FlavorText);
    }

    SpawnChance(info) {
        if (!info.CommonEnemy || info.PlayerSafe || !info.Sky) return 0;
        if (!Terraria.NPC.downedBoss2) return 0;
        return 0.004;
    }

    HagShoot(npc, player) {
        if (this._proType === -1) this._proType = ModProjectile.getTypeByName('CyanHagPro') ?? -2;
        if (this._proType <= 0) return;

        const target = player.Center;
        NewProjectile(null, Vector2.new(target.X, target.Y + 8), Vector2.Zero, this._proType, 25, 0, Main.myPlayer, 0, 0, 0, null);
    }

    ModifyNPCLoot(npcLoot) {
        const notExpert = Conditions.NotExpert ? Conditions.NotExpert.new() : null;
        const isExpert = Conditions.IsExpert ? Conditions.IsExpert.new() : null;

        {
            if (notExpert && isExpert) {
                npcLoot.Add(ItemDropRule.ByCondition(notExpert, 751, 1, 3, 5, 1));
                npcLoot.Add(ItemDropRule.ByCondition(isExpert, 751, 1, 8, 15, 1));
            } else {
                npcLoot.Add(ItemDropRule.Common(751, 1, 3, 5));
            }
        }
        {
            if (notExpert && isExpert) {
                npcLoot.Add(ItemDropRule.ByCondition(notExpert, 320, 3, 1, 3, 1));
                npcLoot.Add(ItemDropRule.ByCondition(isExpert, 320, 3, 2, 5, 1));
            } else {
                npcLoot.Add(ItemDropRule.Common(320, 3, 1, 3));
            }
        }
    }
}
