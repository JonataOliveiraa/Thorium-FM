import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModBuff } from './../../TL/ModBuff.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ProjAI } from './../../TL/ProjAI.js';

const { Effects, Vector2, Rand } = Modules;
const { Main } = Terraria;
const CanHit = Terraria.Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];
const SolidCollision = Terraria.Collision['bool SolidCollision(Vector2 Position, int Width, int Height)'];

const SIGHT = 260;            // alcance de visao (era 700)
const MARKED_SIGHT = 2.2;     // alvo marcado pelo jogador ele acha bem melhor
const AIM_INTERVAL = 40;      // so corrige a mira a cada N ticks
const AIM_SPREAD = 170;       // erro de mira em px (metade com alvo marcado)
const FOCUS_TIME = 210;       // depois disso ele perde o alvo de vista
const SEARCH_DELAY = 90;      // tempo perdido procurando de novo
const SPEED = 7;              // velocidade de perseguicao (era 12)
const TURN = 26;              // inercia: quanto maior, mais ele passa direto
const IDLE_SPEED = 9;
const IDLE_TURN = 39;

const CLUMSY = 1.10;
const WEAVE_RATE = 0.09;
const WEAVE_ATTACK = 2.4;
const WEAVE_IDLE = 1.5;
const Y_DAMP = 0.62;
const REVERSE_TURN = 1.8;
const WANDER_RADIUS = 220;    // ele vagueia em volta do jogador quando se perde

// Pra onde ele olha
const FACE_DEADZONE = 0.5;    // velocidade minima pra virar de lado
const FACE_IDLE_SPEED = 1.2;  // abaixo disso ele copia o lado que o jogador olha
const FACE_FLIP = -1;         // a textura padrao olha pra esquerda

// Colisao com o cenario (feita na mao, ver ClampToTiles)
const BOUNCE = 0.25;          // sobra de velocidade ao raspar na parede
const STUCK_TICKS = 40;       // tempo batendo na parede antes de atravessar
const PHASE_TICKS = 100;      // quanto tempo fica atravessando pra se soltar
const FAR_SQ = 250000;        // 500px: longe demais, volta atravessando tudo

// Estado por slot de projetil (a instancia do ModProjectile e compartilhada)
const MAX_PROJ = Terraria.Main.maxProjectiles ?? 1000;
const _stuck = new Int16Array(MAX_PROJ);
const _phase = new Int16Array(MAX_PROJ);

export class StormHatchlingStaffPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this.MinionBuff = null;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = 5;

        Terraria.ID.ProjectileID.Sets.TrackMinionSpawnFromItemUse[this.Type] = true;
        Terraria.ID.ProjectileID.Sets.MinionTargetingFeature[this.Type] = true;
        Terraria.ID.ProjectileID.Sets.MinionSacrificable[this.Type] = true;
        Terraria.ID.ProjectileID.Sets.CultistIsResistantTo[this.Type] = true;
    }

    SetDefaults() {
        this.Projectile.aiStyle = -1;
        // O quadro tem 74x44 e a hitbox era 18x28: o corpo desenhado entrava
        // no bloco muito antes da caixa encostar. 34x34 cobre o corpo (o resto
        // dos 74px sao as asas abertas).
        this.Projectile.width = 34;
        this.Projectile.height = 34;
        // tileCollide fica FALSE de proposito: o TL so mata o projetil pela
        // colisao da vanilla quando essa flag esta ligada. A colisao e feita
        // na mao em ClampToTiles, entao ele bate na parede sem sumir.
        this.Projectile.tileCollide = false;
        this.Projectile.ignoreWater = true;
        this.Projectile.friendly = true;
        this.Projectile.minion = true;
        this.Projectile.minionSlots = 1;
        this.Projectile.penetrate = -1;
    }

    CanCutTiles(proj) {
        return false;
    }

    OnSpawn(proj) {
        _stuck[proj.whoAmI] = 0;
        _phase[proj.whoAmI] = 0;
    }

    /**
     * ai[0]  = contador ate corrigir a mira
     * ai[1]  = foco restante no alvo (negativo = perdido, procurando)
     * ai[2]  = alvo atual (-1 = nenhum)
     * localAI[0..1] = erro de mira atual (offset em px)
     */
    AI(proj) {
        if (this.MinionBuff === null) this.MinionBuff = ModBuff.getTypeByName('StormHatchlingStaffBuff');

        const player = Main.player[proj.owner];
        if (!this.CheckActive(proj, player)) return;

        const ai = new ProjAI(proj, false);
        const local = new ProjAI(proj, true);

        // Perdeu o alvo ha pouco: passa um tempo sem conseguir achar nada
        if (ai[1] < 0) {
            ai[1] = ai[1] + 1;
            ai[2] = -1;
            this.IdleMovement(proj, player, local);
            this.Finish(proj, player, ai);
            return;
        }

        const target = this.GetTarget(proj, player, ai[2]);

        if (target) {
            // Alvo novo (ou foco zerado): recomeca a contagem de atencao
            if (ai[2] !== target.whoAmI || ai[1] <= 0) ai[1] = FOCUS_TIME;

            ai[1] = ai[1] - 1;
            ai[2] = target.whoAmI;
            this.Attack(proj, target, ai, local, player);

            // Cansou de acompanhar: solta o alvo e se perde de novo
            if (ai[1] <= 0) {
                ai[1] = -SEARCH_DELAY;
                ai[2] = -1;
            }
        } else {
            if (ai[2] >= 0) ai[1] = -SEARCH_DELAY; // acabou de perder de vista
            ai[2] = -1;
            if (ai[1] > 0) ai[1] = 0;
            this.IdleMovement(proj, player, local);
        }

        this.Finish(proj, player, ai);
    }

    Finish(proj, player, ai) {
        const center = proj.Center;
        const playerCenter = player.Center;
        const dx = playerCenter.X - center.X;
        const dy = playerCenter.Y - center.Y;
        const distSq = dx * dx + dy * dy;

        if (distSq > 4000000) {
            proj.Center = playerCenter;
            ai[1] = 0;
            ai[2] = -1;
            _stuck[proj.whoAmI] = 0;
        }

        this.ClampToTiles(proj, distSq);

        proj.rotation = proj.velocity.X * 0.05;
        this.Facing(proj, player);
        this.Visuals(proj);
    }

    /**
     * Colisao manual, testando um eixo de cada vez.
     *
     * A ideia: antes do jogo aplicar o movimento, a gente simula pra onde ele
     * iria e pergunta se aquele ponto e bloco solido. Se for, zera so aquele
     * eixo, entao ele desliza pela parede em vez de grudar nela. Nada disso
     * passa pela colisao da vanilla, que mataria o projetil.
     *
     * Se ficar batendo no mesmo canto por muito tempo, ou se estiver longe do
     * jogador, ele atravessa o cenario por um tempo pra nao ficar preso.
     */
    ClampToTiles(proj, distSq) {
        const slot = proj.whoAmI;

        if (_phase[slot] > 0) {
            _phase[slot]--;
            return;
        }

        // Longe do jogador ele volta atravessando tudo
        if (distSq > FAR_SQ) return;

        const pos = proj.position;
        const vel = proj.velocity;
        const w = proj.width;
        const h = proj.height;

        let vx = vel.X;
        let vy = vel.Y;
        if (vx === 0 && vy === 0) return;

        // Ja esta dentro de um bloco (empurrado, ou colocaram bloco em cima):
        // libera a passagem, senao ele ficaria travado pra sempre
        if (SolidCollision(pos, w, h)) {
            _stuck[slot] = 0;
            _phase[slot] = PHASE_TICKS;
            return;
        }

        let blocked = false;

        // Horizontal primeiro; depois vertical ja considerando o X corrigido
        if (vx !== 0 && SolidCollision(Vector2.new(pos.X + vx, pos.Y), w, h)) {
            vx = -vx * BOUNCE;
            blocked = true;
        }

        if (vy !== 0 && SolidCollision(Vector2.new(pos.X + vx, pos.Y + vy), w, h)) {
            vy = -vy * BOUNCE;
            blocked = true;
        }

        if (!blocked) {
            if (_stuck[slot] > 0) _stuck[slot]--;
            return;
        }

        proj.velocity = Vector2.new(vx, vy);

        if (++_stuck[slot] >= STUCK_TICKS) {
            _stuck[slot] = 0;
            _phase[slot] = PHASE_TICKS;
        }
    }

    // Olha pra onde esta indo; quase parado, acompanha o olhar do jogador
    Facing(proj, player) {
        const vx = proj.velocity.X;

        if (Math.abs(vx) > FACE_DEADZONE) {
            proj.direction = vx > 0 ? 1 : -1;
        } else if (Math.abs(vx) < FACE_IDLE_SPEED) {
            proj.direction = player.direction;
        }

        proj.spriteDirection = proj.direction * FACE_FLIP;
    }

    // Mira num ponto errado perto do inimigo e so corrige de vez em quando
    Attack(proj, target, ai, local, player) {
        const marked = player.HasMinionAttackTargetNPC && player.MinionAttackTargetNPC === target.whoAmI;

        if (ai[0] <= 0) {
            ai[0] = AIM_INTERVAL + Rand.Next(40);
            const spread = marked ? AIM_SPREAD * 0.5 : AIM_SPREAD;
            local[0] = (Math.random() * 2 - 1) * spread;
            local[1] = (Math.random() * 2 - 1) * spread;
        } else {
            ai[0] = ai[0] - 1;
        }

        const center = proj.Center;
        const aimX = target.Center.X + local[0];
        const aimY = target.Center.Y + local[1];
        const dx = aimX - center.X;
        const dy = aimY - center.Y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        this.Steer(proj, dx, dy, dist, SPEED, TURN, WEAVE_ATTACK, local);
    }

    Steer(proj, dx, dy, dist, speed, turn, weave, local) {
        const dirX = dx / dist;
        const dirY = dy / dist;

        local[2] = (local[2] + WEAVE_RATE) % (Math.PI * 2);
        const sine = Math.sin(local[2]);
        const amplitude = weave * CLUMSY;

        const desiredX = dirX * speed + -dirY * sine * amplitude;
        const desiredY = (dirY * speed + dirX * sine * amplitude) * Y_DAMP;

        const vel = proj.velocity;
        const base = turn * CLUMSY;
        const turnX = desiredX * vel.X < 0 ? base * REVERSE_TURN : base;
        const turnY = desiredY * vel.Y < 0 ? base * REVERSE_TURN : base;

        proj.velocity = Vector2.new(
            (vel.X * turnX + desiredX) / (turnX + 1),
            (vel.Y * turnY + desiredY) / (turnY + 1)
        );
    }

    // Sem alvo ele vagueia em volta do jogador em vez de ficar colado
    IdleMovement(proj, player, local) {
        const center = proj.Center;
        const playerCenter = player.Center;

        let idleX = playerCenter.X + player.direction * -40 + local[0] * 0.6;
        let idleY = playerCenter.Y - 60 + local[1] * 0.4;

        const dx = idleX - center.X;
        const dy = idleY - center.Y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Chegou no posto: escolhe outro ponto solto por perto (procurando)
        if (dist < 24) {
            local[0] = (Math.random() * 2 - 1) * WANDER_RADIUS;
            local[1] = (Math.random() * 2 - 1) * WANDER_RADIUS * 0.5;
        }

        if (dist > 10) {
            this.Steer(proj, dx, dy, dist, IDLE_SPEED, IDLE_TURN, WEAVE_IDLE, local);
        } else {
            proj.velocity = Vector2.Multiply(proj.velocity, 0.9);
        }
    }

    // So enxerga perto e precisa de linha de visao (nao ve atraves de parede)
    GetTarget(proj, player, oldTarget) {
        if (player.HasMinionAttackTargetNPC) {
            const marked = Main.npc[player.MinionAttackTargetNPC];
            if (marked && marked.active && marked.CanBeChasedBy(proj, false) &&
                Vector2.Distance(proj.Center, marked.Center) < SIGHT * MARKED_SIGHT) {
                return marked;
            }
        }

        if (oldTarget >= 0) {
            const previous = Main.npc[oldTarget];
            if (previous && previous.active && previous.CanBeChasedBy(proj, false) &&
                Vector2.Distance(proj.Center, previous.Center) < SIGHT * 1.3 &&
                this.CanSee(proj, previous)) {
                return previous;
            }
        }

        const found = proj.FindTargetWithinRange(SIGHT, true);
        if (found && found.active && found.CanBeChasedBy(proj, false) && this.CanSee(proj, found)) {
            return found;
        }

        return null;
    }

    CanSee(proj, npc) {
        return CanHit(proj.position, proj.width, proj.height, npc.position, npc.width, npc.height);
    }

    CheckActive(proj, player) {
        if (!player || player.dead || !player.active) {
            if (player) player.ClearBuff(this.MinionBuff);
            return false;
        }
        if (player.FindBuffIndex(this.MinionBuff) >= 0) proj.timeLeft = 2;
        return true;
    }

    Visuals(proj) {
        if (++proj.frameCounter >= 5) {
            proj.frameCounter = 0;
            proj.frame = (proj.frame + 1) % Main.projFrames[this.Type];
        }

        Effects.AddLight(proj.Center, 0.78, 0.32, 0.1);
    }
}
