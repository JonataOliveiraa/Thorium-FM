const Main = new NativeClass("Terraria", "Main")
const NewText = Main['void NewText(string newText, byte R, byte G, byte B)'];

const Profiler = {
  _timers: {},
  _enabled: true,
  _reportCounter: 0,
  _reportInterval: 300,
  _thresholds: {
    time: {
      low: 1,
      medium: 5,
      high: 16
    },
    calls: {
      low: 300,
      medium: 1000,
      high: 3000
    }
  },

  Start(name) {
    if (!this._enabled) return;
    if (!this._timers[name]) {
      this._timers[name] = {
        start: 0,
        calls: 0,
        totalTime: 0,
        maxTime: 0,
        minTime: Infinity,
        lastTime: 0
      };
    }
    this._timers[name].start = Date.now();
    this._timers[name].calls++;
  },

  End(name) {
    if (!this._enabled || !this._timers[name]) return;
    const elapsed = Date.now() - this._timers[name].start;
    this._timers[name].totalTime += elapsed;
    this._timers[name].lastTime = elapsed;
    if (elapsed > this._timers[name].maxTime) {
      this._timers[name].maxTime = elapsed;
    }
    if (elapsed < this._timers[name].minTime) {
      this._timers[name].minTime = elapsed;
    }
  },

  GetTimePerformanceLevel(avgTime) {
    if (avgTime <= this._thresholds.time.low) return { text: "EXCELLENT", color: [0, 255, 0] };
    if (avgTime <= this._thresholds.time.medium) return { text: "GOOD", color: [100, 255, 0] };
    if (avgTime <= this._thresholds.time.high) return { text: "MEDIUM", color: [255, 255, 0] };
    if (avgTime <= 33) return { text: "HIGH", color: [255, 150, 0] };
    if (avgTime <= 50) return { text: "LAG", color: [255, 50, 0] };
    return { text: "T:CRITICAL", color: [255, 0, 0] };
  },

  GetCallsPerformanceLevel(calls) {
    if (calls <= this._thresholds.calls.low) return { text: "LOW", color: [0, 255, 0] };
    if (calls <= this._thresholds.calls.medium) return { text: "MEDIUM", color: [255, 255, 0] };
    if (calls <= this._thresholds.calls.high) return { text: "HIGH", color: [255, 150, 0] };
    return { text: "VERY HIGH", color: [255, 0, 0] };
  },

  GetOverallPerformance(avgTime, calls) {
    const timePerf = avgTime <= this._thresholds.time.high;
    const callsPerf = calls <= this._thresholds.calls.medium;

    if (timePerf && callsPerf) return { text: "GREAT", color: [0, 255, 0] };
    if (timePerf || callsPerf) return { text: "GOOD", color: [255, 255, 0] };
    return { text: "REVIEW", color: [255, 0, 0] };
  },

  Update() {
    if (!this._enabled) return;
    this._reportCounter++;
    if (this._reportCounter >= this._reportInterval) {
      this.Report();
      this._reportCounter = 0;
    }
  },

  Export() {
    let report = "=== PROFILER EXPORT ===\n";
    report += `Date: ${new Date().toLocaleString()}\n`;
    report += `World: ${Main.worldName}\n`;
    report += `Players: ${Main.player.length}\n\n`;

    for (const [name, data] of Object.entries(this._timers)) {
      if (data.calls > 0) {
        const avg = data.totalTime / data.calls;
        const timePerf = this.GetTimePerformanceLevel(avg);
        const callsPerf = this.GetCallsPerformanceLevel(data.calls);
        const overall = this.GetOverallPerformance(avg, data.calls);

        report += `${name}:\n`;
        report += `  Calls: ${data.calls} (${callsPerf.text})\n`;
        report += `  Avg Time: ${avg.toFixed(3)}ms (${timePerf.text})\n`;
        report += `  Overall: ${overall.text}\n\n`;
      }
    }

    return report;
  },

  Report() {
    if (!this._enabled) return;

    let totalTime = 0;
    let totalCalls = 0;
    let worstAvg = 0;
    let worstName = "";
    let worstCalls = 0;
    let worstCallsName = "";

    for (const [name, data] of Object.entries(this._timers)) {
      if (data.calls > 0) {
        totalTime += data.totalTime;
        totalCalls += data.calls;
        const avg = data.totalTime / data.calls;

        if (avg > worstAvg) {
          worstAvg = avg;
          worstName = name;
        }
        if (data.calls > worstCalls) {
          worstCalls = data.calls;
          worstCallsName = name;
        }
      }
    }

    const overall = this.GetOverallPerformance(worstAvg, worstCalls);

    NewText("=== PROFILER ===", 200, 200, 200);
    NewText(`Performance: ${overall.text}`, overall.color[0], overall.color[1], overall.color[2]);
    NewText(`Total Calls: ${totalCalls} | Time: ${totalTime.toFixed(2)}ms`, 200, 200, 200);
    NewText(`Worst Time: ${worstName} (${worstAvg.toFixed(3)}ms)`, 255, 150, 150);
    NewText(`Most Calls: ${worstCallsName} (${worstCalls})`, 255, 150, 150);
    NewText(" ", 255, 255, 255);

    for (const [name, data] of Object.entries(this._timers)) {
      if (data.calls > 0) {
        const avg = data.totalTime / data.calls;
        const timePerf = this.GetTimePerformanceLevel(avg);
        const callsPerf = this.GetCallsPerformanceLevel(data.calls);
        const overall = this.GetOverallPerformance(avg, data.calls);

        NewText(`${name}`, overall.color[0], overall.color[1], overall.color[2]);
        NewText(`  ${avg.toFixed(3)}ms ${timePerf.text} | ${data.calls} calls ${callsPerf.text}`, timePerf.color[0], timePerf.color[1], timePerf.color[2]);
      }
    }

    NewText("=================", 200, 200, 200);
    this.Reset();
  },

  Reset() {
    for (const key of Object.keys(this._timers)) {
      this._timers[key].calls = 0;
      this._timers[key].totalTime = 0;
      this._timers[key].maxTime = 0;
      this._timers[key].minTime = Infinity;
    }
  },

  Toggle() {
    this._enabled = !this._enabled;
    NewText(`Profiler ${this._enabled ? "ENABLED" : "DISABLED"}`, 255, 255, 0);
  }
};

export { Profiler };