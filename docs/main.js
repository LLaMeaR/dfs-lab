// ---------- utils ----------
const $ = (sel) => document.querySelector(sel);

// ---------- tabs ----------
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');
tabBtns.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    tabBtns.forEach(b=> b.classList.remove('active'));
    tabPanels.forEach(p=> p.classList.remove('active'));
    btn.classList.add('active');
    $('#tab-' + btn.dataset.tab).classList.add('active');
  });
});

// ---------- Visualizer ----------
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

function parseEdges(text){
  const lines = text.trim().split(/\n+/);
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
  const edges = parseEdges(edgesEl.value);
  const g = buildAdj(n, edges, dirEl.checked);
  const start = +startEl.value|0;
  modeEl.value === 'recursive' ? runRecursive(g, start) : runIterative(g, start);
});

// ---------- Problem engine ----------
// reference DFS helpers (JS)
function ccCount(n, edges){ // undirected
  const g = buildAdj(n, edges, false);
  const seen = new Array(n).fill(false);
  let cnt=0;
  function dfs(v){ seen[v]=true; for(const nx of g[v]) if(!seen[nx]) dfs(nx); }
  for(let v=0; v<n; v++){
    if(!seen[v]){ cnt++; dfs(v); }
  }
  return cnt;
}
function hasCycleUndirected(n, edges){
  const g = buildAdj(n, edges, false);
  const seen = new Array(n).fill(false);
  let found=false;
  function dfs(v, p){
    seen[v]=true;
    for(const nx of g[v]){
      if(nx===p) continue;
      if(seen[nx]){ found=true; return; }
      dfs(nx, v); if(found) return;
    }
  }
  for(let v=0; v<n && !found; v++) if(!seen[v]) dfs(v,-1);
  return found;
}
function topoIsValid(n, edges, seq){
  if(seq.length!==n) return false;
  const pos = new Array(n).fill(-1);
  for(let i=0;i<n;i++){
    const v=seq[i]; if(v<0 || v>=n) return false;
    if(pos[v]!==-1) return false; // duplicate
    pos[v]=i;
  }
  for(const [u,v] of edges){
    // if edge u->v, u must come before v
    if(pos[u] > pos[v]) return false;
  }
  return true;
}
function countIslands4(grid){
  if(!grid.length || !grid[0].length) return 0;
  const R=grid.length, C=grid[0].length;
  const seen = Array.from({length:R},()=>Array(C).fill(false));
  const DIR4=[[-1,0],[1,0],[0,-1],[0,1]];
  function dfs(r,c){
    seen[r][c]=true;
    for(const [dr,dc] of DIR4){
      const nr=r+dr, nc=c+dc;
      if(nr>=0&&nr<R&&nc>=0&&nc<C&&grid[nr][nc]===1&&!seen[nr][nc]) dfs(nr,nc);
    }
  }
  let cnt=0;
  for(let r=0;r<R;r++) for(let c=0;c<C;c++){
    if(grid[r][c]===1 && !seen[r][c]){ cnt++; dfs(r,c); }
  }
  return cnt;
}
function parseGrid(text){
  // "1 0 1\n0 1 0" -> [[1,0,1],[0,1,0]]
  return text.trim().split(/\n+/).map(row=> row.trim().split(/\s+/).map(Number));
}

// problem set (간단 4문제)
const PROBLEMS = [
  {
    id:'cc',
    title:'Connected Components (undirected)',
    type:'graph',
    directed:false,
    n:8,
    edges:[[0,1],[1,2],[3,4],[5,6],[6,7]],
    ask:'How many connected components?',
    notes:'무방향 그래프의 연결요소 개수. 시각화로 구조를 확인한 뒤 직접 세어보세요.',
    checker:(ans,{n,edges})=>{
      const expect = ccCount(n, edges);
      const got = Number(String(ans).trim());
      return {ok: got===expect, expect: String(expect)};
    },
  },
  {
    id:'cycle_u',
    title:'Cycle detection (undirected)',
    type:'graph',
    directed:false,
    n:5,
    edges:[[0,1],[1,2],[2,0],[2,3]],
    ask:'Does this graph contain a cycle? (yes/no)',
    notes:'무방향 그래프 DFS에서 부모가 아닌 방문 이웃을 만나면 사이클.',
    checker:(ans,{n,edges})=>{
      const expect = hasCycleUndirected(n, edges);
      const s = String(ans).trim().toLowerCase();
      const got = (s==='y'||s==='yes'||s==='true'||s==='1');
      return {ok: got===expect, expect: expect? 'yes':'no'};
    },
  },
  {
    id:'topo',
    title:'Topological Order (DAG)',
    type:'graph',
    directed:true,
    n:6,
    edges:[[5,2],[5,0],[4,0],[4,1],[2,3],[3,1]],
    ask:'Enter any valid topological order (space-separated).',
    notes:'여러 정답이 가능. 입력한 순서가 모든 간선 u→v에 대해 u가 v보다 앞이면 정답.',
    checker:(ans,{n,edges})=>{
      const seq = String(ans).trim().split(/\s+/).map(Number);
      const ok = topoIsValid(n, edges, seq);
      return {ok, expect:'(any valid topological order) e.g., 5 4 2 3 1 0'};
    },
  },
  {
    id:'grid_islands',
    title:'Count Islands in Grid (4-dir)',
    type:'grid',
    ask:'How many islands (4-direction)?',
    grid:
`1 1 0 0 0
0 1 0 1 1
0 0 0 1 0
1 0 0 0 0`,
    notes:'상하좌우로만 연결. 대각선은 X.',
    checker:(ans,{grid})=>{
      const g = parseGrid(grid);
      const expect = countIslands4(g);
      const got = Number(String(ans).trim());
      return {ok: got===expect, expect: String(expect)};
    },
  },
];

// wire UI
const problemSelect = $('#problemSelect');
const problemTitle  = $('#problemTitle');
const problemDesc   = $('#problemDesc');
const notes         = $('#notes');
const answerInput   = $('#answerInput');
const verdict       = $('#verdict');
const loadToVizBtn  = $('#loadToVizBtn');
const showSolutionBtn = $('#showSolutionBtn');
const gridBox       = $('#gridBox');
const gridInput     = $('#gridInput');
const checkBtn      = $('#checkBtn');

let cur = null;

function renderProblem(p){
  cur = p;
  problemTitle.textContent = p.title;
  // description & ask
  let desc = '';
  if(p.type==='graph'){
    desc += `<p><b>Graph:</b> n=${p.n}, ${p.directed?'directed':'undirected'}</p>`;
    desc += `<p><b>Edges:</b> ${p.edges.map(e=>`(${e[0]},${e[1]})`).join(', ')}</p>`;
  }else{
    desc += `<p><b>Grid:</b> 아래 입력을 확인/수정 후 정답을 입력하세요.</p>`;
  }
  desc += `<p><b>Question:</b> ${p.ask}</p>`;
  problemDesc.innerHTML = desc;

  notes.textContent = p.notes || '';

  answerInput.value = '';
  verdict.textContent = '';

  if(p.type==='grid'){
    gridBox.classList.remove('hidden');
    gridInput.value = p.grid.trim();
  }else{
    gridBox.classList.add('hidden');
  }
}

function loadProblems(){
  PROBLEMS.forEach((p,i)=>{
    const opt = document.createElement('option');
    opt.value = p.id; opt.textContent = `${i+1}. ${p.title}`;
    problemSelect.appendChild(opt);
  });
  renderProblem(PROBLEMS[0]);
}
loadProblems();

problemSelect.addEventListener('change', ()=>{
  const p = PROBLEMS.find(x=> x.id===problemSelect.value);
  renderProblem(p);
});

loadToVizBtn.addEventListener('click', ()=>{
  if(!cur || cur.type!=='graph') return;
  vertexCountEl.value = cur.n;
  dirEl.checked = !!cur.directed;
  edgesEl.value = cur.edges.map(e=> `${e[0]} ${e[1]}`).join('\n');
  // 탭 전환도 도와주기
  document.querySelector('[data-tab="viz"]').click();
});

showSolutionBtn.addEventListener('click', ()=>{
  if(!cur) return;
  if(cur.type==='graph'){
    if(cur.id==='cc'){
      verdict.textContent = `Ans: ${ccCount(cur.n, cur.edges)}`;
    }else if(cur.id==='cycle_u'){
      verdict.textContent = `Ans: ${hasCycleUndirected(cur.n, cur.edges) ? 'yes' : 'no'}`;
    }else if(cur.id==='topo'){
      verdict.textContent = `One valid order: 5 4 2 3 1 0`;
    }else{
      verdict.textContent = '';
    }
  }else{
    const g = parseGrid(gridInput.value);
    verdict.textContent = `Ans: ${countIslands4(g)}`;
  }
});

checkBtn.addEventListener('click', ()=>{
  if(!cur) return;
  let payload = {};
  if(cur.type==='graph'){
    payload = {n:cur.n, edges:cur.edges};
  }else{
    payload = {grid:gridInput.value};
  }
  const {ok, expect} = cur.checker(answerInput.value, payload);
  verdict.textContent = ok ? 'Correct ✅' : `Wrong ❌  (expected: ${expect})`;
});
