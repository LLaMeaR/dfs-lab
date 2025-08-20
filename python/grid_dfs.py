from typing import List, Tuple

DIR4: List[Tuple[int,int]] = [(-1,0),(1,0),(0,-1),(0,1)]

def count_islands(grid: List[List[int]]) -> int:
    if not grid or not grid[0]:
        return 0
    R, C = len(grid), len(grid[0])
    seen = [[False]*C for _ in range(R)]

    def dfs(r,c):
        seen[r][c] = True
        for dr,dc in DIR4:
            nr, nc = r+dr, c+dc
            if 0<=nr<R and 0<=nc<C and grid[nr][nc]==1 and not seen[nr][nc]:
                dfs(nr,nc)

    cnt = 0
    for r in range(R):
        for c in range(C):
            if grid[r][c]==1 and not seen[r][c]:
                cnt += 1
                dfs(r,c)
    return cnt
