from grid_dfs import count_islands

def test_islands_basic():
    grid = [
        [1,1,0,0],
        [1,0,0,1],
        [0,0,1,1],
        [0,0,0,0],
    ]
    assert count_islands(grid) == 3
