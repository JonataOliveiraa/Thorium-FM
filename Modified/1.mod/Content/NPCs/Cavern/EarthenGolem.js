import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { Effects } from '../../../TL/Modules/Effects.js';

const { Color, Vector2 } = Modules;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];
const Projectile = new NativeClass('Terraria', 'Projectile');
const NewProjectile = Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const SoundEngine = new NativeClass('Terraria.Audio', 'SoundEngine');

export class EarthenGolem extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/Cavern/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        Terraria.Main.npcFrameCount[this.Type] = 22; 
    }
    
    SetDefaults() {
        this.NPC.width = 40;
        this.NPC.height = 50; 
        this.NPC.aiStyle = 3; 
        this.NPC.damage = 30;
        this.NPC.defense = 15;
        this.NPC.lifeMax = 200;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit41; 
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath43; 
        this.NPC.value = ModNPC.NPCValue(0, 0, 5, 0);
        this.NPC.knockBackResist = 0.2; 
    }
    
    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Jungle);
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Underground);
        
        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate('Bestiary.EarthenGolem');
        bestiaryEntry.Info.Add(FlavorText);
    }

    SpawnChance(info) {
        if (info.CommonEnemy && info.SpawnTileY > Terraria.Main.rockLayer && info.Underground && info.SpawnTileY < Terraria.Main.maxTilesY - 200 && !info.Water) {
            return 0.03;
        }
        return 0;
    }

    PreAI(npc) {
        if (npc.localAI[1] === 1) {
            let vel = npc.velocity;
            vel.X = 0;
            npc.velocity = vel;

            npc.localAI[2]++;

            if (npc.localAI[2] >= 180) {
                const player = Terraria.Main.player[npc.target];
                if (player && player.active && !player.dead) {
                    const spawnY = player.Center.Y - 500; 
                    
                    NewProjectile(
                        Projectile.GetNoneSource(),
                        Vector2.new(player.Center.X, spawnY),
                        Vector2.new(0, 6),
                        ModProjectile.getTypeByName('EarthenRock'),
                        20,
                        2,
                        Terraria.Main.myPlayer,
                        0, 0, 0,
                        null
                    );
                    SoundEngine['void PlaySound(int type, Vector2 position, int style, float pitchOffset)'](70, npc.Center, 1, 1.0);
                }

                npc.localAI[1] = 0; 
                npc.localAI[2] = 0; 
                npc.localAI[0] = 0; 
            }
            return false; 
        } 
        
        npc.TargetClosest(true);
        npc.localAI[0]++; 
        
        if (npc.localAI[0] >= 240) {
            const player = Terraria.Main.player[npc.target];
            
            if (player && player.active && !player.dead) {
                const distance = Vector2.Distance(npc.Center, player.Center);
                if (distance < 400) {
                    npc.localAI[1] = 1; 
                    npc.localAI[2] = 0; 
                    npc.localAI[0] = 0; 
                }
            }
        }
        return true; 
    }

    OnHitPlayer(npc, target, damage, crit) {
        for (let i = 0; i < 15; i++) {
            const speedX = (Math.random() - 0.5) * 6;
            const speedY = (Math.random() - 0.5) * 6;
            NewDust(
                target.position, target.width, target.height, 
                109, speedX, speedY, 0, Color.new(0,0,0,255), 1.5
            );
        }
    }

    FindFrame(npc, frameHeight) {
        npc.spriteDirection = npc.direction;
        let frame = npc.frame;
        const player = Terraria.Main.player[npc.target];

        if (npc.localAI[1] === 1) {
            let animFrame = 10 + Math.floor(npc.localAI[2] / 15);
            if (animFrame > 21) animFrame = 21; 
            frame.Y = frameHeight * animFrame;
            npc.frame = frame;
            return;
        }

        if (npc.velocity.X === 0 && npc.velocity.Y === 0) {
            let isAttacking = false;
            if (player && player.active && !player.dead) {
                const distanceX = Math.abs(npc.Center.X - player.Center.X);
                const distanceY = Math.abs(npc.Center.Y - player.Center.Y);
                if (distanceX < npc.width + 20 && distanceY < npc.height + 20) {
                    isAttacking = true;
                }
            }

            if (isAttacking) {
                frame.Y = frameHeight * 1; 
                npc.frame = frame;
                return;
            }

            frame.Y = 0; 
            npc.frame = frame; 
            return;
        }

        if (frame.Y < frameHeight * 2 || frame.Y > frameHeight * 9) {
            frame.Y = frameHeight * 2;
        }

        npc.frameCounter += Math.abs(npc.velocity.X);
        
        if (npc.frameCounter >= 6.0) { 
            frame.Y += frameHeight; 
            npc.frameCounter = 0.0;     
        }
        
        if (frame.Y > frameHeight * 9) { 
            frame.Y = frameHeight * 2;
        }

        npc.frame = frame;
    }
}