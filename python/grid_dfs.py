# python/grid_dfs.py
from typing import List, Tuple

DIR4: List[Tuple[int,int]] = [(-1,0),(1,0),(0,-1),(0,1)]
DIR8: List[Tuple[int,int]] = [
    (-1,0),(1,0),(0,-1),(0,1),
    (-1,-1),(-1,1),(1,-1),(1,1),
]

def _count_islands_with_dirs(grid: List[List[int]], dirs: List[Tuple[int,int]]) -> int:
    if not grid or not grid[0]:
        return 0
    R, C = len(grid), len(grid[0])
    seen = [[False]*C for _ in range(R)]

    def dfs(r: int, c: int) -> None:
        seen[r][c] = True
        for dr, dc in dirs:
            nr, nc = r + dr, c + dc
            if 0 <= nr < R and 0 <= nc < C and grid[nr][nc] == 1 and not seen[nr][nc]:
                dfs(nr, nc)

    cnt = 0
    for r in range(R):
        for c in range(C):
            if grid[r][c] == 1 and not seen[r][c]:
                cnt += 1
                dfs(r, c)
    return cnt

def count_islands(grid: List[List[int]]) -> int:
    """4-방향(상하좌우) 기준 섬 개수"""
    return _count_islands_with_dirs(grid, DIR4)

def count_islands8(grid: List[List[int]]) -> int:
    """8-방향(대각 포함) 기준 섬 개수"""
    return _count_islands_with_dirs(grid, DIR8)
