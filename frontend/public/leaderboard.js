/**
 * Leaderboard System for Wasteland Zero
 * Displays top players and allows score submission
 */

const Leaderboard = {
  currentSort: 'total_xp',
  
  async init() {
    console.log('Leaderboard initialized');
  },
  
  async show() {
    const modal = document.getElementById('leaderboard-modal');
    if (!modal) {
      console.error('Leaderboard modal not found');
      return;
    }
    
    modal.classList.add('show');
    await this.loadLeaderboard('total_xp');
  },
  
  hide() {
    const modal = document.getElementById('leaderboard-modal');
    if (modal) {
      modal.classList.remove('show');
    }
  },
  
  async loadLeaderboard(sortBy = 'total_xp') {
    this.currentSort = sortBy;
    const contentDiv = document.getElementById('lb-content');
    if (!contentDiv) return;
    
    // Show loading state
    contentDiv.innerHTML = '<div class="lb-loading">⏳ Loading leaderboard...</div>';
    
    try {
      const apiUrl = window.BACKEND_URL || '';
      const response = await fetch(`${apiUrl}/api/leaderboard/top?limit=10&sort_by=${sortBy}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.players && data.players.length > 0) {
        this.renderLeaderboard(data.players, sortBy);
      } else {
        contentDiv.innerHTML = '<div class="lb-empty">🏜️ No scores yet. Be the first!</div>';
      }
      
      // Update active tab
      document.querySelectorAll('.lb-tab').forEach(tab => {
        tab.classList.remove('active');
      });
      const activeTab = document.getElementById(`lb-tab-${sortBy}`);
      if (activeTab) {
        activeTab.classList.add('active');
      }
      
    } catch (error) {
      console.error('Leaderboard load error:', error);
      contentDiv.innerHTML = `<div class="lb-error">❌ Failed to load leaderboard<br><small>${error.message}</small></div>`;
    }
  },
  
  renderLeaderboard(players, sortBy) {
    const contentDiv = document.getElementById('lb-content');
    if (!contentDiv) return;
    
    const sortLabels = {
      'total_xp': 'XP',
      'caps_earned': 'Caps',
      'rifts_discovered': 'Rifts',
      'deepest_level': 'Level',
      'bosses_killed': 'Bosses'
    };
    
    let html = `
      <div class="lb-table-container">
        <table class="lb-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Class</th>
              <th>${sortLabels[sortBy] || 'Score'}</th>
              <th>XP</th>
              <th>Caps</th>
              <th>Rifts</th>
              <th>Bosses</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    players.forEach((player, index) => {
      const rank = index + 1;
      let rankClass = '';
      let rankHTML = rank;
      
      if (rank === 1) {
        rankClass = 'rank-1';
        rankHTML = `<span class="lb-rank gold">👑 1</span>`;
      } else if (rank === 2) {
        rankClass = 'rank-2';
        rankHTML = `<span class="lb-rank silver">🥈 2</span>`;
      } else if (rank === 3) {
        rankClass = 'rank-3';
        rankHTML = `<span class="lb-rank bronze">🥉 3</span>`;
      } else {
        rankHTML = `<span class="lb-rank">${rank}</span>`;
      }
      
      const archetype = player.archetype || 'Survivor';
      const race = player.race || '';
      const classInfo = race ? `${race} ${archetype}` : archetype;
      
      html += `
        <tr class="${rankClass}">
          <td>${rankHTML}</td>
          <td class="lb-player-name">${this.escapeHtml(player.player_name)}</td>
          <td>${this.escapeHtml(classInfo)}</td>
          <td><strong>${this.formatNumber(player[sortBy] || 0)}</strong></td>
          <td>${this.formatNumber(player.total_xp || 0)}</td>
          <td>${this.formatNumber(player.caps_earned || 0)}💰</td>
          <td>${player.rifts_discovered || 0}🌀</td>
          <td>${player.bosses_killed || 0}💀</td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
      </div>
    `;
    
    contentDiv.innerHTML = html;
  },
  
  async submitScore(playerName, stats) {
    if (!playerName || playerName.trim().length === 0) {
      console.error('Invalid player name');
      return { success: false, message: 'Invalid player name' };
    }
    
    try {
      const apiUrl = window.BACKEND_URL || '';
      const response = await fetch(`${apiUrl}/api/leaderboard/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          player_name: playerName.trim().substring(0, 30),
          total_xp: stats.total_xp || 0,
          caps_earned: stats.caps_earned || 0,
          rifts_discovered: stats.rifts_discovered || 0,
          deepest_level: stats.deepest_level || 1,
          archetype: stats.archetype || null,
          race: stats.race || null,
          territory: stats.territory || null,
          bosses_killed: stats.bosses_killed || 0
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('Score submission error:', error);
      return { success: false, message: error.message };
    }
  },
  
  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  },
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// Initialize on load
if (typeof window !== 'undefined') {
  window.Leaderboard = Leaderboard;
  Leaderboard.init();
}
