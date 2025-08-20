from typing import Dict, List

def dfs_iterative(graph: Dict[int, List[int]], start: int) -> List[int]:
    visited, order = set(), []
    stack = [start]
    while stack:
        v = stack.pop()
        if v in visited:
            continue
        visited.add(v)
        order.append(v)
        # 재귀와 동일한 순서를 원하면 역순으로 push
        for nxt in reversed(graph[v]):
            if nxt not in visited:
                stack.append(nxt)
    return order
