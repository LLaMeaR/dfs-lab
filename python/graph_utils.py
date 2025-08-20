from typing import List, Dict, Iterable, Tuple

def build_adj_list(n: int, edges: Iterable[Tuple[int, int]], directed: bool=False) -> Dict[int, List[int]]:
    g = {i: [] for i in range(n)}
    for u, v in edges:
        g[u].append(v)
        if not directed:
            g[v].append(u)
    for k in g:
        g[k].sort()  # 순서 안정화
    return g
