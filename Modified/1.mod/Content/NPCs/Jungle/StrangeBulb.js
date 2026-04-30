import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { Effects } from '../../../TL/Modules/Effects.js';
import { ModItem } from '../../../TL/ModItem.js';

const { Color, Vector2 } = Modules;
const { ItemDropRule } = Terraria.GameContent.ItemDropRules
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;

const Projectile = new NativeClass('Terraria', 'Projectile');
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

const SoundEngine = new NativeClass('Terraria.Audio', 'SoundEngine');

export class StrangeBulb extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/Jungle/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        Terraria.Main.npcFrameCount[this.Type] = 4;
    }
    
    SetDefaults() {
        this.NPC.width = 22;
        this.NPC.height = 16; 
        this.NPC.aiStyle = -1;
        this.NPC.damage = 7;
        this.NPC.defense = 5;
        this.NPC.lifeMax = 100;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath1;
        this.NPC.value = ModNPC.NPCValue(0, 0, 50, 0);
        this.NPC.knockBackResist = 0;
    }
    
    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Jungle);
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Underground);
        
        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate('Bestiary.StrangeBulb');
        bestiaryEntry.Info.Add(FlavorText);
    }

    AI(npc) {
        npc.velocity.X = 0;
        npc.TargetClosest(false);

        Effects.AddLight(npc.Center, 0.6, 0.2, 0.4);

        const player = Terraria.Main.player[npc.target];
        if (!player || !player.active || player.dead) return;

        const distanceX = player.Center.X - npc.Center.X;
        const distanceY = player.Center.Y - npc.Center.Y;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        if (distance < 450 && distanceY < 20) {
            
            const canHit = Terraria.Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'](
                npc.position, npc.width, npc.height,
                player.position, player.width, player.height
            );

            if (canHit) {
                npc.ai[0]++; 
                
                if (npc.ai[0] >= 100) {
                    const speed = 7.5;
                    const velX = (distanceX / distance) * speed;
                    const velY = (distanceY / distance) * speed;

                    NewProjectile(
                        Projectile.GetNoneSource(),
                        Vector2.new(npc.Center.X, npc.Center.Y - 10),
                        Vector2.new(velX, velY),
                        ModProjectile.getTypeByName('StrangeBulbPro'),
                        10,
                        0,
                        Terraria.Main.myPlayer,
                        0, 0, 0,
                        null
                    );

                    SoundEngine['void PlaySound(int type, Vector2 position, int style, float pitchOffset)'](17, npc.Center, 1, 1.1);
                    npc.ai[0] = 0; 
                }
            } else {
                if (npc.ai[0] > 0) npc.ai[0]--;
            }
        } else {
            if (npc.ai[0] > 0) npc.ai[0]--;
        }
    }

    SpawnChance(info) {
        if (info.CommonEnemy && info.Player.ZoneJungle && info.SpawnTileY > Terraria.Main.worldSurface) {
            return 0.10;
        }
        return 0;
    }

    ModifyNPCLoot(npcLoot) {
        npcLoot.Add(ItemDropRule.Common(ModItem.getTypeByName('Petal'), 2, 2, 3));
    }

    FindFrame(npc, frameHeight) {
        let frame = npc.frame;

        // A animação depende unicamente do tempo de tiro
        if (npc.ai[0] < 50) {
            frame.Y = 0; 
        } else if (npc.ai[0] < 80) {
            frame.Y = frameHeight * 1; 
        } else if (npc.ai[0] < 100) {
            frame.Y = frameHeight * 2; 
        } else {
            frame.Y = frameHeight * 3; 
        }

        npc.frame = frame;
    }
}