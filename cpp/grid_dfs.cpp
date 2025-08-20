#include <bits/stdc++.h>
using namespace std;
int dr[4]={-1,1,0,0}, dc[4]={0,0,-1,1};

void dfs(int r,int c, vector<vector<int>>& g, vector<vector<int>>& seen){
    int R=g.size(), C=g[0].size();
    seen[r][c]=1;
    for(int k=0;k<4;k++){
        int nr=r+dr[k], nc=c+dc[k];
        if(0<=nr && nr<R && 0<=nc && nc<C && g[nr][nc]==1 && !seen[nr][nc])
            dfs(nr,nc,g,seen);
    }
}

int count_islands(vector<vector<int>> g){
    if(g.empty()) return 0;
    int R=g.size(), C=g[0].size(), cnt=0;
    vector<vector<int>> seen(R, vector<int>(C));
    for(int r=0;r<R;r++) for(int c=0;c<C;c++)
        if(g[r][c]==1 && !seen[r][c]){ cnt++; dfs(r,c,g,seen); }
    return cnt;
}

int main(){
    vector<vector<int>> grid={{1,1,0,0},{1,0,0,1},{0,0,1,1},{0,0,0,0}};
    cout << count_islands(grid) << "\n"; // 3
}
