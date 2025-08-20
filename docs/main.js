const $ = (sel) => document.querySelector(sel);
const orderEl = $('#order'), stackEl = $('#stack'), traceEl = $('#trace');
const edgesEl = $('#edges'), startEl = $('#start'), dirEl = $('#directed');
const modeEl = $('#mode'), speedEl = $('#speed'), speedOut = $('#speedOut');
const runBtn = $('#runBtn'), pauseBtn = $('#pauseBtn'), stepBtn = $('#stepBtn'), resetBtn = $('#resetBtn');
const vertexCountEl = $('#vertexCount');

speedEl.addEventListener('input', ()=> speedOut.textContent = `${speedEl.value}ms`);
speedOut.textContent = `${speedEl.value}ms`;

class Exec {
  constructor(ms){ this.ms = +ms; this.autoplay = true; this.queue = []; this.timer = null; this.abort=false; }
  setSpeed(ms){ this.ms = +ms; }
  push(fn){ this.queue.push(fn); if(this.autoplay && !this.timer) this._tick(); }
  pause(){ this.autoplay = false; if(this.timer){ clearTimeout(this.timer); this.timer=null; } }
  resume(){ if(!this.autoplay){ this.autoplay=true; this._tick(); } }
  step(){ if(this.queue.length){ const fn = this.queue.shift(); fn(); } }
  reset(){ this.pause(); this.queue=[]; this.abort=true; setTimeout(()=> this.abort=false,0); }
  _tick(){
    if(!this.autoplay) return;
    if(!this.queue.length){ this.timer=null; return; }
    this.timer = setTimeout(()=>{
      if(this.abort) return;
      const fn = this.queue.shift(); fn(); this._tick();
    }, this.ms);
  }
}
const exec = new Exec(speedEl.value);
pauseBtn.onclick = ()=> exec.pause();
runBtn.onclick   = ()=> exec.resume();
stepBtn.onclick  = ()=> exec.step();
resetBtn.onclick = ()=> { exec.reset(); clearPanels(); };
speedEl.onchange = ()=> exec.setSpeed(speedEl.value);

function clearPanels(){ orderEl.innerHTML = ''; stackEl.innerHTML = ''; traceEl.innerHTML = ''; }
function badge(txt){ const b = document.createElement('span'); b.className='badge'; b.textContent = txt; return b; }
function logTrace(text){ const d = document.createElement('div'); d.className='step'; d.textContent = text; traceEl.appendChild(d); traceEl.scrollTop = traceEl.scrollHeight; }
function renderStack(stk){ stackEl.innerHTML=''; stk.slice().reverse().forEach(x=> stackEl.appendChild(badge(String(x)))); }

function parseEdges(){
  const lines = edgesEl.value.trim().split(/\n+/);
  const edges = [];
  for(const ln of lines){
    const m = ln.trim().match(/^(\d+)\s+(\d+)$/);
    if(m) edges.push([+m[1], +m[2]]);
  }
  return edges;
}
function buildAdj(n, edges, directed){
  const g = Array.from({length:n}, ()=> []);
  for(const [u,v] of edges){
    g[u].push(v); if(!directed) g[v].push(u);
  }
  g.forEach(arr=> arr.sort((a,b)=> a-b));
  return g;
}

function runRecursive(g, start){
  clearPanels();
  const seen = new Array(g.length).fill(false);
  const callStack = [`call(${start})`];
  renderStack(callStack);
  function dfs(v){
    exec.push(()=> { logTrace(`enter ${v}`); renderStack(callStack); });
    seen[v]=true; exec.push(()=> orderEl.appendChild(badge(String(v))));
    for(const nxt of g[v]){
      if(!seen[nxt]){
        callStack.push(`call(${nxt})`);
        dfs(nxt);
        exec.push(()=> { logTrace(`return ${nxt} -> ${v}`); });
        callStack.pop();
      }
    }
    exec.push(()=> { logTrace(`exit  ${v}`); renderStack(callStack); });
  }
  dfs(start);
}

function runIterative(g, start){
  clearPanels();
  const seen = new Array(g.length).fill(false);
  const stk = [start]; renderStack(stk);
  while(stk.length){
    const v = stk.pop();
    exec.push(()=> { logTrace(`pop ${v}`); renderStack(stk); });
    if(seen[v]){ exec.push(()=> logTrace(`skip ${v}`)); continue; }
    seen[v]=true; exec.push(()=> orderEl.appendChild(badge(String(v))));
    for(const nxt of [...g[v]].reverse()){
      if(!seen[nxt]){ stk.push(nxt); exec.push(()=> { logTrace(`push ${nxt}`); renderStack(stk); }); }
    }
  }
}

runBtn.addEventListener('click', ()=>{
  const n = +vertexCountEl.value|0;
  const edges = parseEdges();
  const g = buildAdj(n, edges, dirEl.checked);
  const start = +startEl.value|0;
  modeEl.value === 'recursive' ? runRecursive(g, start) : runIterative(g, start);
});
