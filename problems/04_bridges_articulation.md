# 04. Bridges & Articulation Points
**목표**: 무방향 그래프의 브리지(단절선) / 단절점 찾기 (Tarjan low-link).

**힌트**
- `tin[v]`: 방문 시간, `low[v]`: v가 갈 수 있는 가장 이른 시간
- 브리지: `low[to] > tin[v]`
- 단절점: 루트의 자식 ≥ 2, or `low[to] >= tin[v]` (루트 외)
