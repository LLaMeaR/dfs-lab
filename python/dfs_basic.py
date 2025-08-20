from typing import Dict, List, Optional

def dfs_recursive(graph: Dict[int, List[int]], start: int, visited: Optional[set]=None, order: Optional[List[int]]=None):
    if visited is None: visited = set()
    if order is None: order = []
    visited.add(start)
    order.append(start)
    for nxt in graph[start]:
        if nxt not in visited:
            dfs_recursive(graph, nxt, visited, order)
    return order

def dfs_full(graph: Dict[int, List[int]]) -> List[List[int]]:
    """비연결 그래프의 각 연결요소 방문 순서 반환"""
    visited, components = set(), []
    for v in graph.keys():
        if v not in visited:
            comp = []
            _dfs_comp(graph, v, visited, comp)
            components.append(comp)
    return components

def _dfs_comp(graph, v, visited, comp):
    visited.add(v); comp.append(v)
    for nxt in graph[v]:
        if nxt not in visited:
            _dfs_comp(graph, nxt, visited, comp)
