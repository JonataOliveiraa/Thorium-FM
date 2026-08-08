# Criação de mods acelerada

### Fluxo
1 - Pegue as texturas necessárias para o item, projétil, npc, etc. do mod: todas elas ficam em C:\Users\nadek\Downloads\tModUnpacker\ThoriumMod.
2 - Leia o código C# do item/projétil/npc, etc. E adapte para o TL Pro, todas elas ficam em C:\Users\nadek\Downloads\tModUnpacker\dll\ThoriumMod.
3 - E então, crie os arquivos, adaptando a coisa que vc quer adicionar no TL Pro.

### Práticas
- Em projectiles, ao usar ai[], sempre use ProjAI.
- Ao mover o Vector2 de algum source, não faça tipo npc.velocity.X++, invés disso, você pode atribuir um Vector2 já alterado. O TL Pro não reconhece alterações em struct, então se você fizer npc.velocity.X++, o TL Pro não vai reconhecer que houve uma alteração no npc.velocity. Então, faça algo como:
```js
   const vel = npc.velocity;
    vel.X++;
    npc.velocity = vel;
```
- Ao criar um item, projétil, npc, etc., sempre use o método SetDefaults() para definir os valores padrões do objeto. Evite definir valores diretamente no construtor ou em outros métodos, pois isso pode causar problemas de compatibilidade com o TL Pro.
- Sempre que possível, utilize as funções e métodos fornecidos pela pasta Modules/, pois eles são otimizados para o TL Pro e garantem melhor desempenho e compatibilidade.
- Sempre que possível, use métodos nativos do Terraria, exemplo:
```js
    for(int i = 0; i < Main.maxNPCs; i++) {
        NPC npc = Main.npc[i];
        if(Vector.Distance(npc.Center, player.Center) < 100) {
            // Faça algo com o npc
        }
    }

    //faça
    const findedNPC = proj['NPC FindTargetWithinRange(float maxRange, bool checkCanHit)'](
        100, false
    )
```
- Nunca coloque loops em Update() ou AI() que possam causar travamentos.
- Métodos privados o TL Pro também reconhece.
- Nunca mude a ordem de registro do item, projétil, npc, etc. no Register/, sempre adicione itens recém criados no topo da lista, pra facilitar testes.