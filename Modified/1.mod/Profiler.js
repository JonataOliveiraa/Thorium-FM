const Main = new NativeClass('Terraria', 'Main');
const Stopwatch = new NativeClass('System.Diagnostics', 'Stopwatch');
const SystemGC = new NativeClass('System', 'GC');

const NewText = Main['void NewText(string newText, byte R, byte G, byte B)'];
const _swFreq = Number(Stopwatch.Frequency);
const _getTs = () => Number(Stopwatch['long GetTimestamp()']());
const _toMs = ticks => ticks * 1000 / _swFreq;
const REPORT_S = 10;

export class Profiler {
  static LOG_FILE = 'ProfilerLogs.json';
  static _timers = {};
  static _enabled = false;
  static _lastRpt = _getTs();
  static _mem = { gcMB: 0, gen0: 0, gen1: 0, gen2: 0 };

  static _updateMem() {
    try {
      const b = Number(SystemGC['long GetTotalMemory(bool forceFullCollection)'](false));
      Profiler._mem.gcMB = b / 1048576;
      Profiler._mem.gen0 = SystemGC['int CollectionCount(int generation)'](0);
      Profiler._mem.gen1 = SystemGC['int CollectionCount(int generation)'](1);
      Profiler._mem.gen2 = SystemGC['int CollectionCount(int generation)'](2);
    } catch (_) { }
  }

  static _grade(avg) {
    if (avg <= 0.1) return 'EXCELLENT';
    if (avg <= 1) return 'GREAT';
    if (avg <= 5) return 'GOOD';
    if (avg <= 16) return 'MODERATE';
    return 'CRITICAL';
  }

  static Start(name) {
    if (!Profiler._enabled) return;
    if (!Profiler._timers[name]) {
      Profiler._timers[name] = { startTs: 0, calls: 0, totalMs: 0, maxMs: 0, minMs: Infinity };
    }
    Profiler._timers[name].calls++;
    Profiler._timers[name].startTs = _getTs();
  }

  static End(name) {
    if (!Profiler._enabled || !Profiler._timers[name] || Profiler._timers[name].startTs === 0) return;
    const ms = _toMs(_getTs() - Profiler._timers[name].startTs);
    const t = Profiler._timers[name];
    t.totalMs += ms;
    if (ms > t.maxMs) t.maxMs = ms;
    if (ms < t.minMs) t.minMs = ms;
    t.startTs = 0;
  }

  static _collect() {
    const entries = [];
    let worstAvg = 0, worstName = '', mostCnt = 0, mostName = '', totalCalls = 0;

    for (const [name, t] of Object.entries(Profiler._timers)) {
      if (t.calls === 0) continue;
      const avg = t.totalMs / t.calls;
      entries.push({ name, avg, max: t.maxMs, min: t.minMs, totalMs: t.totalMs, calls: t.calls, grade: Profiler._grade(avg) });
      totalCalls += t.calls;
      if (avg > worstAvg) { worstAvg = avg; worstName = name; }
      if (t.calls > mostCnt) { mostCnt = t.calls; mostName = name; }
    }

    return { entries, worstAvg, worstName, mostCnt, mostName, totalCalls };
  }

  static _report() {
    Profiler._updateMem();
    const { entries, worstAvg, worstName, mostCnt, mostName, totalCalls } = Profiler._collect();
    const fps = Main.frameRate;

    // Novo cálculo de saúde: custo total dos timers na janela vs. orçamento por frame
    const totalCostMs = entries.reduce((sum, e) => sum + e.totalMs, 0);
    const framesInWindow = (REPORT_S * fps) || 1; // evita divisão por zero
    const costPerFrame = totalCostMs / framesInWindow;
    const budget = 16.67; // 60 FPS
    const hasBomb = entries.some(e => e.avg > 16);

    let health, sR, sG;
    if (costPerFrame <= budget * 0.3 && !hasBomb) {
      health = '[OK] HEALTHY';
      sR = 50; sG = 220;
    } else if (costPerFrame <= budget * 0.5 && !hasBomb) {
      health = '[!!] WARNING';
      sR = 255; sG = 200;
    } else {
      health = '[!!!] CRITICAL';
      sR = 255; sG = 60;
    }

    NewText('========== PROFILER ==========', 200, 200, 200);
    NewText(`  ${health}    FPS: ${fps.toFixed(1)}`, sR, sG, 50);
    NewText(`  GC: ${Profiler._mem.gcMB.toFixed(2)} MB    Gen0:${Profiler._mem.gen0}  Gen1:${Profiler._mem.gen1}  Gen2:${Profiler._mem.gen2}`, 80, 180, 255);
    NewText(`  Window: ${REPORT_S}s    Total calls: ${totalCalls}`, 180, 180, 180);

    if (entries.length > 0) {
      NewText('  ----- Timers -----', 150, 150, 150);
      for (const e of entries) {
        const cr = e.avg <= 1 ? 40 : e.avg <= 5 ? 220 : 255;
        const cg = e.avg <= 1 ? 255 : e.avg <= 5 ? 200 : e.avg <= 16 ? 130 : 50;
        NewText(`  [${e.grade}] ${e.name}  x${e.calls}`, cr, cg, 60);
        NewText(`    avg:${e.avg.toFixed(4)}ms  max:${e.max.toFixed(4)}ms  min:${e.min.toFixed(4)}ms`, cr, cg, 60);
      }
      NewText('  -------------------', 150, 150, 150);
      if (worstName) NewText(`  Slowest : ${worstName}  (${worstAvg.toFixed(4)}ms avg)`, 255, 90, 90);
      if (mostName) NewText(`  Busiest : ${mostName}  (${mostCnt} calls)`, 255, 170, 60);
    } else {
      NewText('  (no timers recorded this window)', 140, 140, 140);
    }

    NewText('==============================', 200, 200, 200);

    Profiler._save(entries, totalCalls, worstName, worstAvg, fps);
    Profiler.Reset();
  }

  static _save(entries, totalCalls, worstName, worstAvg, fps) {
    try {
      let data = { logs: [] };
      if (tl.file.exists(Profiler.LOG_FILE)) {
        try { data = JSON.parse(tl.file.read(Profiler.LOG_FILE)); } catch (_) { }
        if (!Array.isArray(data.logs)) data.logs = [];
      }

      const now = new Date();
      const pad = n => String(n).padStart(2, '0');
      const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

      data.logs.push({
        timestamp: stamp,
        fps: parseFloat(fps.toFixed(2)),
        windowSec: REPORT_S,
        memory: {
          gcMB: parseFloat(Profiler._mem.gcMB.toFixed(3)),
          gen0: Profiler._mem.gen0,
          gen1: Profiler._mem.gen1,
          gen2: Profiler._mem.gen2
        },
        summary: {
          totalCalls: totalCalls,
          healthy: worstAvg <= 5,
          worstTimer: worstName || null,
          worstAvgMs: parseFloat(worstAvg.toFixed(6))
        },
        timers: entries.map(e => ({
          name: e.name,
          grade: e.grade,
          calls: e.calls,
          avgMs: parseFloat(e.avg.toFixed(6)),
          maxMs: parseFloat(e.max.toFixed(6)),
          minMs: parseFloat(e.min.toFixed(6)),
          totalMs: parseFloat(e.totalMs.toFixed(6))
        }))
      });

      const MAX_LOGS = 100;
      if (data.logs.length > MAX_LOGS) {
        data.logs = data.logs.slice(-MAX_LOGS);
      }

      tl.file.write(Profiler.LOG_FILE, JSON.stringify(data, null, 2));
    } catch (_) { }
  }

  static _calculateHealth(entries, totalCalls, fps) {
    // Custo total dos timers na janela (ms)
    const totalCostMs = entries.reduce((sum, e) => sum + e.totalMs, 0);

    // Estimativa de custo por frame (ms)
    const framesInWindow = (REPORT_S * fps) || 1;
    const costPerFrame = totalCostMs / framesInWindow;

    // Limiares: 
    // - VERDE: custo por frame < 30% do orçamento (5ms)
    // - AMARELO: entre 30% e 50% (5-8.3ms)
    // - VERMELHO: > 50% (>8.3ms) ou alguma bomba individual > 16ms
    const budget = 16.67; // 60 FPS
    const hasBomb = entries.some(e => e.avg > 16);

    if (costPerFrame <= budget * 0.3 && !hasBomb) return 'HEALTHY';
    if (costPerFrame <= budget * 0.5 && !hasBomb) return 'WARNING';
    return 'CRITICAL';
  }

  static Reset() {
    for (const k of Object.keys(Profiler._timers)) {
      const t = Profiler._timers[k];
      t.calls = 0; t.totalMs = 0; t.maxMs = 0; t.minMs = Infinity; t.startTs = 0;
    }
  }

  static Toggle() {
    Profiler._enabled = !Profiler._enabled;
    NewText(`[Profiler] ${Profiler._enabled ? 'ENABLED' : 'DISABLED'}`, 255, 255, 0);
  }

  static Tick() {
    if (!Profiler._enabled) return;
    if (_toMs(_getTs() - Profiler._lastRpt) / 1000 >= REPORT_S) {
      Profiler._report();
      Profiler._lastRpt = _getTs();
    }
  }
}