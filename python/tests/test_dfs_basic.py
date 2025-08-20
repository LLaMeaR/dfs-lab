from graph_utils import build_adj_list
from dfs_basic import dfs_recursive, dfs_full
from dfs_iterative import dfs_iterative

def test_dfs_orders_match():
    g = build_adj_list(6, [(0,1),(0,2),(1,3),(1,4),(2,4),(3,5)], directed=False)
    rec = dfs_recursive(g, 0)
    it  = dfs_iterative(g, 0)
    assert rec == it  # 정렬+역순 push로 일치

def test_components():
    g = build_adj_list(6, [(0,1),(1,2),(3,4)], directed=False)
    comps = dfs_full(g)
    assert sorted([tuple(x) for x in comps]) == [(0,1,2),(3,4),(5,)]
