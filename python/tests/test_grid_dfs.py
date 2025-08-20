from grid_dfs import count_islands

def test_islands_basic():
    grid = [
        [1,1,0,0],
        [1,0,0,1],
        [0,0,1,1],
        [0,0,0,0],
    ]
    assert count_islands(grid) == 2

# tests/test_grid_dfs.py (추가 예시)
from grid_dfs import count_islands8
def test_islands_diagonal_connects():
    grid = [
        [1,0,1],
        [0,1,0],
        [1,0,1],
    ]
    # 4방향이면 5개, 8방향이면 1개
    assert count_islands8(grid) == 1
