from grid_dfs import count_islands

DIR8 = [(-1,0),(1,0),(0,-1),(0,1), (-1,-1),(-1,1),(1,-1),(1,1)]

def test_islands_basic():
    grid = [
        [1,1,0,0],
        [1,0,0,1],
        [0,0,1,1],
        [0,0,0,0],
    ]
    assert count_islands(grid) == 2

def count_islands8(grid):
    if not grid or not grid[0]:
        return 0
    R, C = len(grid), len(grid[0])
    seen = [[False]*C for _ in range(R)]
    def dfs(r,c):
        seen[r][c] = True
        for dr,dc in DIR8:
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


from grid_dfs import count_islands8
def test_islands_diagonal_connects():
    grid = [
        [1,0,1],
        [0,1,0],
        [1,0,1],
    ]
    assert count_islands8(grid) == 1
