#include <bits/stdc++.h>
using namespace std;

vector<vector<int>> build_adj(int n, const vector<pair<int,int>>& edges, bool directed=false){
    vector<vector<int>> g(n);
    for(auto [u,v]: edges){
        g[u].push_back(v);
        if(!directed) g[v].push_back(u);
    }
    for(auto& v: g) sort(v.begin(), v.end());
    return g;
}

void dfs_rec(int v, const vector<vector<int>>& g, vector<int>& order, vector<int>& vis){
    vis[v]=1; order.push_back(v);
    for(int nxt: g[v]) if(!vis[nxt]) dfs_rec(nxt,g,order,vis);
}

vector<int> dfs_iter(int s, const vector<vector<int>>& g){
    vector<int> order; vector<int> vis(g.size());
    vector<int> st = {s};
    while(!st.empty()){
        int v = st.back(); st.pop_back();
        if(vis[v]) continue;
        vis[v]=1; order.push_back(v);
        for(auto it = g[v].rbegin(); it!=g[v].rend(); ++it)
            if(!vis[*it]) st.push_back(*it);
    }
    return order;
}

int main(){
    auto g = build_adj(6, {{0,1},{0,2},{1,3},{1,4},{2,4},{3,5}}, false);
    vector<int> vis(6), order;
    dfs_rec(0,g,order,vis);
    cout << "recursive:"; for(int x: order) cout << ' ' << x; cout << "\n";
    auto it = dfs_iter(0,g);
    cout << "iterative:"; for(int x: it) cout << ' ' << x; cout << "\n";
}
