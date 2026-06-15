// app.js - Core Dashboard Application Logic

// Constants
const STORAGE_KEY = 'smart_student_dashboard_state';
const DSA_RANKS = [
  { name: 'Rookie', threshold: 0, icon: '🐣', color: '#9ca3af' },
  { name: 'Veteran', threshold: 10, icon: '⚔️', color: '#10b981' },
  { name: 'Elite', threshold: 25, icon: '🛡️', color: '#0ea5e9' },
  { name: 'Pro', threshold: 50, icon: '🔥', color: '#f59e0b' },
  { name: 'Master', threshold: 100, icon: '👑', color: '#8b5cf6' },
  { name: 'Grandmaster', threshold: 250, icon: '🌟', color: '#ec4899' },
  { name: 'Legendary', threshold: 500, icon: '🏆', color: '#ef4444' }
];

// Initial mock state if LocalStorage is empty
const defaultState = {
  theme: 'dark',
  subjects: [
    { id: 'sub-1', name: 'Computer Science', color: '#6366f1', icon: 'laptop' },
    { id: 'sub-2', name: 'Mathematics', color: '#ec4899', icon: 'calculator' },
    { id: 'sub-3', name: 'Physics', color: '#10b981', icon: 'atom' }
  ],
  tasks: [
    { id: 'task-1', subjectId: 'sub-1', title: 'Complete Binary Search Problems', dueDate: '2026-06-16', priority: 'high', completed: false, duration: 60 },
    { id: 'task-2', subjectId: 'sub-2', title: 'Study Calculus Limits', dueDate: '2026-06-15', priority: 'medium', completed: true, duration: 45 },
    { id: 'task-3', subjectId: 'sub-3', title: 'Solve Waves & Oscillation Problems', dueDate: '2026-06-18', priority: 'low', completed: false, duration: 30 }
  ],
  dsa: {
    problems: [
      { id: 'dsa-1', title: 'Two Sum', difficulty: 'Easy', platform: 'LeetCode', date: '2026-06-14', url: 'https://leetcode.com/problems/two-sum/' },
      { id: 'dsa-2', title: 'Add Two Numbers', difficulty: 'Medium', platform: 'LeetCode', date: '2026-06-14', url: 'https://leetcode.com/problems/add-two-numbers/' },
      { id: 'dsa-3', title: 'Reverse Linked List', difficulty: 'Easy', platform: 'LeetCode', date: '2026-06-15', url: 'https://leetcode.com/problems/reverse-linked-list/' },
      { id: 'dsa-4', title: 'Median of Two Sorted Arrays', difficulty: 'Hard', platform: 'LeetCode', date: '2026-06-15', url: 'https://leetcode.com/problems/median-of-two-sorted-arrays/' }
    ]
  },
  streak: {
    count: 3,
    lastActiveDate: '2026-06-15',
    history: ['2026-06-13', '2026-06-14', '2026-06-15']
  },
  notes: [
    { id: 'note-1', title: 'Calculus Cheat Sheet', content: 'Limit rules: \n1. lim (x->c) k = k\n2. lim (x->c) x = c\nDerivative rules:\n- d/dx(x^n) = n*x^(n-1)\n- d/dx(sin x) = cos x', color: '#ffb84d', tags: ['Math', 'Calculus'], updatedAt: '2026-06-15T12:00:00Z' },
    { id: 'note-2', title: 'Big O Notation Summary', content: '- O(1): Constant Time\n- O(log n): Logarithmic Time (Binary Search)\n- O(n): Linear Time (Single loop)\n- O(n log n): Merge Sort, Quick Sort\n- O(n^2): Bubble Sort, Nested loops', color: '#85e3ff', tags: ['DSA', 'Theory'], updatedAt: '2026-06-15T11:00:00Z' }
  ],
  exams: [
    { id: 'exam-1', name: 'Physics Midterm Quiz', date: '2026-06-22T09:00:00', subjectId: 'sub-3' },
    { id: 'exam-2', name: 'Mathematics Semester Exam', date: '2026-06-25T14:30:00', subjectId: 'sub-2' }
  ],
  activities: [
    { id: 'act-1', text: 'Completed "Study Calculus Limits"', icon: 'fa-circle-check', timestamp: '2026-06-15T10:30:00' },
    { id: 'act-2', text: 'Logged DSA Solved: "Reverse Linked List"', icon: 'fa-code', timestamp: '2026-06-15T11:45:00' },
    { id: 'act-3', text: 'Logged DSA Solved: "Median of Two Sorted Arrays"', icon: 'fa-code', timestamp: '2026-06-15T12:15:00' }
  ]
};

// Global Application Instance
const App = {
  state: null,
  charts: {},

  // Start Application
  init() {
    this.loadState();
    this.applyTheme();
    this.checkStreak();
    this.setupViewRouter();
    this.setupEventListeners();
    this.initTimerModule();
    this.startCountdownTick();
    
    // Initial Render of default view (Dashboard)
    this.navigateTo('dashboard');
    this.updateGlobalHeaderElements();
  },

  // State Management
  loadState() {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (serialized) {
        this.state = JSON.parse(serialized);
      } else {
        this.state = JSON.parse(JSON.stringify(defaultState));
        this.saveState();
      }
    } catch (e) {
      console.error("Could not load state from localStorage, using defaults.", e);
      this.state = JSON.parse(JSON.stringify(defaultState));
    }
  },

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error("Could not save state to localStorage.", e);
    }
  },

  // UI Theme Logic
  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.state.theme || 'dark');
    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      const isDark = this.state.theme === 'dark';
      toggleBtn.innerHTML = isDark 
        ? '<i class="fa-solid fa-sun"></i> Light Mode' 
        : '<i class="fa-solid fa-moon"></i> Dark Mode';
    }
  },

  toggleTheme() {
    this.state.theme = this.state.theme === 'dark' ? 'light' : 'dark';
    this.saveState();
    this.applyTheme();
    
    // Recreate charts to pick up proper font/grid colors for the theme
    this.renderDashboardCharts();
  },

  // Streak Calculation
  checkStreak() {
    const todayStr = this.getFormattedDate(new Date());
    const streak = this.state.streak;

    if (!streak.lastActiveDate) {
      streak.count = 0;
      streak.history = [];
      this.saveState();
      return;
    }

    const lastDate = new Date(streak.lastActiveDate);
    const todayDate = new Date(todayStr);
    
    // Difference in calendar days
    const diffTime = Math.abs(todayDate - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1) {
      // Streak broken
      streak.count = 0;
      this.saveState();
    }
  },

  triggerActivityProgress() {
    const todayStr = this.getFormattedDate(new Date());
    const streak = this.state.streak;

    if (streak.lastActiveDate === todayStr) {
      // Already active today
      return;
    }

    if (!streak.lastActiveDate) {
      streak.count = 1;
    } else {
      const lastDate = new Date(streak.lastActiveDate);
      const todayDate = new Date(todayStr);
      const diffTime = Math.abs(todayDate - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak.count++;
      } else {
        streak.count = 1;
      }
    }

    streak.lastActiveDate = todayStr;
    if (!streak.history.includes(todayStr)) {
      streak.history.push(todayStr);
    }
    
    this.saveState();
    this.updateGlobalHeaderElements();
  },

  // Activity Logger
  logActivity(text, icon = 'fa-circle-info') {
    const activity = {
      id: 'act-' + Date.now(),
      text,
      icon,
      timestamp: new Date().toISOString()
    };
    this.state.activities.unshift(activity);
    if (this.state.activities.length > 5) {
      this.state.activities.pop();
    }
    this.saveState();
  },

  // View Navigation Router
  setupViewRouter() {
    const menuItems = document.querySelectorAll('.sidebar-menu .menu-item');
    menuItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = item.getAttribute('data-view');
        this.navigateTo(targetView);
      });
    });

    // Mobile Sidebar Toggle
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    const sidebar = document.querySelector('aside.sidebar');
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-active');
      });
    }

    // Close mobile sidebar when clicking main content
    const mainContent = document.querySelector('main.main-content');
    if (mainContent && sidebar) {
      mainContent.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && sidebar.classList.contains('mobile-active') && !e.target.closest('#sidebar-toggle-btn')) {
          sidebar.classList.remove('mobile-active');
        }
      });
    }
  },

  navigateTo(viewId) {
    // Hide all views, display target
    const sections = document.querySelectorAll('.view-section');
    sections.forEach(sec => sec.classList.remove('active'));

    const targetSection = document.getElementById(`${viewId}-view`);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    // Set menu active class
    const menuItems = document.querySelectorAll('.sidebar-menu .menu-item');
    menuItems.forEach(item => {
      if (item.getAttribute('data-view') === viewId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Close sidebar on mobile after navigating
    const sidebar = document.querySelector('aside.sidebar');
    if (sidebar) sidebar.classList.remove('mobile-active');

    // Render corresponding screen layout
    this.renderScreen(viewId);
  },

  renderScreen(viewId) {
    switch(viewId) {
      case 'dashboard':
        this.renderDashboard();
        break;
      case 'subjects':
        this.renderSubjects();
        break;
      case 'planner':
        this.renderPlanner();
        break;
      case 'dsa':
        this.renderDSA();
        break;
      case 'notes':
        this.renderNotes();
        break;
      case 'tools':
        this.renderTools();
        break;
    }
  },

  // Setup UI Event Listeners (Forms, Modals, Action Buttons)
  setupEventListeners() {
    // Theme Toggle
    document.getElementById('theme-toggle-btn').addEventListener('click', () => this.toggleTheme());

    // Subject Form Submit
    document.getElementById('subject-form').addEventListener('submit', (e) => this.handleSubjectCreate(e));

    // Task Form Submit
    document.getElementById('task-form').addEventListener('submit', (e) => this.handleTaskCreate(e));

    // DSA Form Submit
    document.getElementById('dsa-form').addEventListener('submit', (e) => this.handleDSALog(e));

    // Exam Form Submit
    document.getElementById('exam-form').addEventListener('submit', (e) => this.handleExamCreate(e));

    // Note Search Filter
    const searchInput = document.getElementById('note-search');
    if (searchInput) {
      searchInput.addEventListener('input', () => this.renderNotes());
    }

    // Add Note Modal trigger
    document.getElementById('add-note-btn').addEventListener('click', () => this.openNoteEditorModal());
    document.getElementById('save-note-modal-btn').addEventListener('click', () => this.handleNoteSave());

    // Modal closes
    const closeBtns = document.querySelectorAll('.modal-close, .modal-cancel');
    closeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        if (modal) modal.classList.remove('active');
      });
    });

    // Quick subject add from list
    const openSubModalBtn = document.getElementById('add-subject-modal-btn');
    if (openSubModalBtn) {
      openSubModalBtn.addEventListener('click', () => {
        document.getElementById('subject-modal').classList.add('active');
      });
    }

    // Color picker selection visual
    const dots = document.querySelectorAll('.color-dot');
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        dots.forEach(d => d.classList.remove('selected'));
        dot.classList.add('selected');
      });
    });
  },

  // --- SCREEN RENDERS & HANDLERS ---

  updateGlobalHeaderElements() {
    const today = new Date();
    const formatted = today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    
    const headerDate = document.getElementById('header-date');
    if (headerDate) headerDate.innerText = formatted;

    const headerStreak = document.getElementById('header-streak');
    if (headerStreak) {
      headerStreak.innerHTML = `<i class="fa-solid fa-fire"></i> ${this.state.streak.count} Day Streak`;
    }

    // Update profile block in sidebar
    const profileAvatar = document.querySelector('.profile-avatar');
    if (profileAvatar) {
      // First character of student
      profileAvatar.innerText = 'ST'; 
    }

    const profileRank = document.querySelector('.profile-rank');
    if (profileRank) {
      const dsaRank = this.calculateDSARank();
      profileRank.innerHTML = `${dsaRank.icon} ${dsaRank.name}`;
    }
  },

  // 1. DASHBOARD VIEW
  renderDashboard() {
    this.updateGlobalHeaderElements();

    // Stats Cards counts
    document.getElementById('stat-total-subjects').innerText = this.state.subjects.length;
    
    const totalTasks = this.state.tasks.length;
    const completedTasks = this.state.tasks.filter(t => t.completed).length;
    document.getElementById('stat-task-progress').innerText = `${completedTasks}/${totalTasks}`;
    document.getElementById('stat-task-sub').innerText = totalTasks > 0 
      ? `${Math.round((completedTasks/totalTasks)*100)}% Tasks Completed` 
      : 'No Tasks Scheduled';

    document.getElementById('stat-streak-val').innerText = `${this.state.streak.count} Days`;
    
    const dsaRank = this.calculateDSARank();
    document.getElementById('stat-dsa-rank').innerText = dsaRank.name;
    document.getElementById('stat-dsa-sub').innerText = `${dsaRank.icon} ${this.state.dsa.problems.length} Problems Solved`;

    // Render activity feed
    const activityContainer = document.getElementById('dashboard-activities');
    if (activityContainer) {
      if (this.state.activities.length === 0) {
        activityContainer.innerHTML = '<div class="text-muted text-center py-4">No recent activities. Complete tasks or solve DSA problems to populate.</div>';
      } else {
        activityContainer.innerHTML = this.state.activities.map(act => `
          <div class="activity-item">
            <div class="activity-icon">
              <i class="fa-solid ${act.icon}"></i>
            </div>
            <div class="activity-content">
              <div>${act.text}</div>
              <div class="activity-time">${this.formatRelativeTime(act.timestamp)}</div>
            </div>
          </div>
        `).join('');
      }
    }

    // Render the analytics graphs
    this.renderDashboardCharts();
  },

  renderDashboardCharts() {
    // Grab visual theme colors
    const isDark = this.state.theme === 'dark';
    const textColor = isDark ? '#9ca3af' : '#4b5563';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

    // 1. DSA Chart
    const dsaCtx = document.getElementById('dsa-distribution-chart');
    if (dsaCtx) {
      if (this.charts.dsa) this.charts.dsa.destroy();
      
      const easyCount = this.state.dsa.problems.filter(p => p.difficulty === 'Easy').length;
      const mediumCount = this.state.dsa.problems.filter(p => p.difficulty === 'Medium').length;
      const hardCount = this.state.dsa.problems.filter(p => p.difficulty === 'Hard').length;

      const totalProblems = easyCount + mediumCount + hardCount;

      if (totalProblems === 0) {
        // Render Empty Chart State
        this.charts.dsa = new Chart(dsaCtx, {
          type: 'doughnut',
          data: {
            labels: ['No solved problems'],
            datasets: [{
              data: [1],
              backgroundColor: [isDark ? '#1f2937' : '#e5e7eb']
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
          }
        });
      } else {
        this.charts.dsa = new Chart(dsaCtx, {
          type: 'doughnut',
          data: {
            labels: ['Easy', 'Medium', 'Hard'],
            datasets: [{
              data: [easyCount, mediumCount, hardCount],
              backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { color: textColor, font: { family: 'Plus Jakarta Sans' } }
              }
            },
            cutout: '70%'
          }
        });
      }
    }

    // 2. Study Productivity Chart
    const prodCtx = document.getElementById('study-productivity-chart');
    if (prodCtx) {
      if (this.charts.prod) this.charts.prod.destroy();

      const subjects = this.state.subjects;
      const labels = subjects.map(s => s.name);
      
      const completedDataset = [];
      const pendingDataset = [];

      subjects.forEach(sub => {
        const subTasks = this.state.tasks.filter(t => t.subjectId === sub.id);
        const comp = subTasks.filter(t => t.completed).length;
        const pend = subTasks.length - comp;
        completedDataset.push(comp);
        pendingDataset.push(pend);
      });

      const totalTaskLogs = completedDataset.reduce((a,b)=>a+b, 0) + pendingDataset.reduce((a,b)=>a+b, 0);

      if (totalTaskLogs === 0 && subjects.length === 0) {
        this.charts.prod = new Chart(prodCtx, {
          type: 'bar',
          data: {
            labels: ['Add subjects to view charts'],
            datasets: [{ data: [0], backgroundColor: ['#1f2937'] }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
          }
        });
      } else {
        this.charts.prod = new Chart(prodCtx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Completed Tasks',
                data: completedDataset,
                backgroundColor: '#10b981',
                borderRadius: 6
              },
              {
                label: 'Pending Tasks',
                data: pendingDataset,
                backgroundColor: '#6366f1',
                borderRadius: 6
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                grid: { display: false },
                ticks: { color: textColor, font: { family: 'Plus Jakarta Sans' } }
              },
              y: {
                grid: { color: gridColor },
                ticks: { 
                  color: textColor, 
                  precision: 0,
                  font: { family: 'Plus Jakarta Sans' } 
                }
              }
            },
            plugins: {
              legend: {
                position: 'top',
                labels: { color: textColor, font: { family: 'Plus Jakarta Sans' } }
              }
            }
          }
        });
      }
    }
  },

  // 2. SUBJECT MANAGER VIEW
  renderSubjects() {
    const container = document.getElementById('subject-cards-container');
    if (!container) return;

    if (this.state.subjects.length === 0) {
      container.innerHTML = `
        <div class="glass-card text-center py-5 w-100">
          <i class="fa-solid fa-book-open fa-3x mb-3 text-muted"></i>
          <h4>No Subjects Added</h4>
          <p class="text-secondary mb-4">Organize your study calendar by adding courses/subjects.</p>
          <button class="btn btn-primary" onclick="document.getElementById('subject-modal').classList.add('active')">
            <i class="fa-solid fa-plus"></i> Add First Subject
          </button>
        </div>`;
      return;
    }

    container.innerHTML = this.state.subjects.map(sub => {
      // Find tasks for this subject
      const subTasks = this.state.tasks.filter(t => t.subjectId === sub.id);
      const total = subTasks.length;
      const completed = subTasks.filter(t => t.completed).length;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

      return `
        <div class="glass-card subject-card" style="--subject-color: ${sub.color}">
          <div class="subject-header">
            <div>
              <h3 class="subject-name">${sub.name}</h3>
              <span class="text-muted" style="font-size: 0.75rem;">Subject ID: ${sub.id}</span>
            </div>
            <div class="d-flex align-items-center gap-2">
              <span class="subject-tasks-count">${total} Tasks</span>
              <button class="btn btn-danger btn-sm p-1" style="height:26px; width:26px; border-radius:50%" onclick="App.handleSubjectDelete('${sub.id}')">
                <i class="fa-solid fa-trash-can" style="font-size: 0.75rem"></i>
              </button>
            </div>
          </div>
          
          <div class="subject-progress-container">
            <div class="progress-label-bar">
              <span>Task Progress</span>
              <span>${percent}%</span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width: ${percent}%"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  handleSubjectCreate(e) {
    e.preventDefault();
    const nameInput = document.getElementById('subject-name');
    const name = nameInput.value.trim();
    if (!name) return;

    // Grab chosen color from picker
    const selectedColorDot = document.querySelector('.color-dot.selected');
    const color = selectedColorDot ? selectedColorDot.getAttribute('data-color') : '#6366f1';

    const newSubject = {
      id: 'sub-' + Date.now(),
      name,
      color,
      icon: 'book'
    };

    this.state.subjects.push(newSubject);
    this.logActivity(`Added Subject: "${name}"`, 'fa-book-open');
    this.saveState();
    
    // Reset form & close modal
    nameInput.value = '';
    document.getElementById('subject-modal').classList.remove('active');
    this.renderSubjects();
    this.updateGlobalHeaderElements();
  },

  handleSubjectDelete(subjectId) {
    const sub = this.state.subjects.find(s => s.id === subjectId);
    if (!sub) return;

    if (confirm(`Are you sure you want to delete "${sub.name}"? This will delete all associated study tasks and exams.`)) {
      this.state.subjects = this.state.subjects.filter(s => s.id !== subjectId);
      this.state.tasks = this.state.tasks.filter(t => t.subjectId !== subjectId);
      this.state.exams = this.state.exams.filter(ex => ex.subjectId !== subjectId);
      
      this.logActivity(`Deleted Subject: "${sub.name}"`, 'fa-trash-can');
      this.saveState();
      this.renderSubjects();
      this.updateGlobalHeaderElements();
    }
  },

  // 3. STUDY PLANNER VIEW
  currentTaskFilter: 'all',

  renderPlanner() {
    // Populate Subject dropdowns in forms
    const dropdown = document.getElementById('task-subject');
    if (dropdown) {
      dropdown.innerHTML = '<option value="">-- Select Subject --</option>' + 
        this.state.subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    }

    // Populate Filters
    const filterContainer = document.getElementById('task-filters-container');
    if (filterContainer) {
      let filterHTML = `<button class="filter-btn ${this.currentTaskFilter === 'all' ? 'active' : ''}" onclick="App.setTaskFilter('all')">All</button>`;
      filterHTML += `<button class="filter-btn ${this.currentTaskFilter === 'pending' ? 'active' : ''}" onclick="App.setTaskFilter('pending')">Pending</button>`;
      filterHTML += `<button class="filter-btn ${this.currentTaskFilter === 'completed' ? 'active' : ''}" onclick="App.setTaskFilter('completed')">Completed</button>`;
      
      this.state.subjects.forEach(sub => {
        filterHTML += `<button class="filter-btn ${this.currentTaskFilter === sub.id ? 'active' : ''}" onclick="App.setTaskFilter('${sub.id}')">${sub.name}</button>`;
      });
      filterContainer.innerHTML = filterHTML;
    }

    // Render task items
    const listContainer = document.getElementById('task-list-items');
    if (!listContainer) return;

    let filteredTasks = this.state.tasks;
    if (this.currentTaskFilter === 'pending') {
      filteredTasks = this.state.tasks.filter(t => !t.completed);
    } else if (this.currentTaskFilter === 'completed') {
      filteredTasks = this.state.tasks.filter(t => t.completed);
    } else if (this.currentTaskFilter !== 'all') {
      // By Subject ID
      filteredTasks = this.state.tasks.filter(t => t.subjectId === this.currentTaskFilter);
    }

    if (filteredTasks.length === 0) {
      listContainer.innerHTML = `
        <div class="text-center py-5">
          <i class="fa-solid fa-clipboard-list fa-3x mb-3 text-muted"></i>
          <p class="text-secondary">No study tasks found matching the filter.</p>
        </div>`;
      return;
    }

    // Sort: Pending first, then by date/priority
    filteredTasks.sort((a,b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

    listContainer.innerHTML = filteredTasks.map(task => {
      const subject = this.state.subjects.find(s => s.id === task.subjectId);
      const subName = subject ? subject.name : 'Unassigned';
      const subColor = subject ? subject.color : '#6b7280';
      const isChecked = task.completed ? 'checked' : '';

      return `
        <div class="task-card ${task.completed ? 'completed' : ''}">
          <div class="task-left">
            <div class="task-checkbox ${isChecked}" onclick="App.handleTaskToggle('${task.id}')">
              <i class="fa-solid fa-check"></i>
            </div>
            <div class="task-details">
              <span class="task-title">${task.title}</span>
              <div class="task-meta">
                <span class="task-subject-tag" style="background: ${subColor}">${subName}</span>
                <span class="task-priority-tag ${task.priority}">${task.priority} Priority</span>
                <span><i class="fa-solid fa-calendar-day"></i> Due: ${task.dueDate}</span>
                ${task.duration ? `<span><i class="fa-solid fa-clock"></i> ${task.duration} mins</span>` : ''}
              </div>
            </div>
          </div>
          <div class="task-right">
            <i class="fa-regular fa-trash-can task-delete" onclick="App.handleTaskDelete('${task.id}')"></i>
          </div>
        </div>
      `;
    }).join('');
  },

  setTaskFilter(filter) {
    this.currentTaskFilter = filter;
    this.renderPlanner();
  },

  handleTaskCreate(e) {
    e.preventDefault();
    const titleInput = document.getElementById('task-title');
    const subInput = document.getElementById('task-subject');
    const priorityInput = document.getElementById('task-priority');
    const dateInput = document.getElementById('task-due-date');
    const durationInput = document.getElementById('task-duration');

    const title = titleInput.value.trim();
    const subjectId = subInput.value;
    const priority = priorityInput.value;
    const dueDate = dateInput.value;
    const duration = parseInt(durationInput.value) || 30;

    if (!title || !subjectId || !dueDate) {
      alert("Please fill in the Task Title, Subject, and Due Date.");
      return;
    }

    const newTask = {
      id: 'task-' + Date.now(),
      title,
      subjectId,
      priority,
      dueDate,
      duration,
      completed: false
    };

    this.state.tasks.push(newTask);
    this.logActivity(`Created Task: "${title}"`, 'fa-clipboard-list');
    this.saveState();
    
    // Reset Form
    titleInput.value = '';
    dateInput.value = '';
    durationInput.value = '';

    this.renderPlanner();
    this.updateGlobalHeaderElements();
  },

  handleTaskToggle(taskId) {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (!task) return;

    task.completed = !task.completed;
    
    if (task.completed) {
      this.logActivity(`Completed Task: "${task.title}"`, 'fa-circle-check');
      this.triggerActivityProgress();
    } else {
      this.logActivity(`Reopened Task: "${task.title}"`, 'fa-rotate-left');
    }

    this.saveState();
    this.renderPlanner();
    this.updateGlobalHeaderElements();
  },

  handleTaskDelete(taskId) {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (!task) return;

    this.state.tasks = this.state.tasks.filter(t => t.id !== taskId);
    this.logActivity(`Deleted Task: "${task.title}"`, 'fa-trash-can');
    this.saveState();
    this.renderPlanner();
    this.updateGlobalHeaderElements();
  },

  // 4. DSA TRACKER VIEW
  renderDSA() {
    const problems = this.state.dsa.problems;
    const solvedCount = problems.length;

    // Stats layout
    document.getElementById('dsa-solved-count').innerText = solvedCount;

    // Rank evaluation
    const rankObj = this.calculateDSARank();
    document.getElementById('dsa-rank-display').innerText = rankObj.name;
    document.getElementById('dsa-rank-icon-big').innerText = rankObj.icon;

    // Next Rank threshold linear progress bar
    const nextRank = this.calculateNextRank();
    const progressFill = document.getElementById('dsa-progress-fill');
    const progressPercentText = document.getElementById('dsa-progress-percent');
    const progressDesc = document.getElementById('dsa-progress-desc');

    if (nextRank) {
      const currentRankObj = DSA_RANKS.find(r => r.name === rankObj.name);
      const range = nextRank.threshold - currentRankObj.threshold;
      const progressInLevel = solvedCount - currentRankObj.threshold;
      const percent = Math.min(100, Math.max(0, Math.round((progressInLevel / range) * 100)));
      
      progressFill.style.width = `${percent}%`;
      progressPercentText.innerText = `${percent}%`;
      progressDesc.innerText = `${nextRank.threshold - solvedCount} more solved to reach ${nextRank.icon} ${nextRank.name}`;
    } else {
      // Legendary Max Rank reached
      progressFill.style.width = '100%';
      progressPercentText.innerText = '100%';
      progressDesc.innerText = `You are at maximum rank ${rankObj.icon} ${rankObj.name}!`;
    }

    // Render list table
    const tbody = document.getElementById('dsa-problems-list');
    if (!tbody) return;

    if (problems.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-4 text-secondary">
            No DSA Problems logged yet. Add your practice logs below.
          </td>
        </tr>`;
      return;
    }

    // Sort by date descending
    const sortedProbs = [...problems].sort((a,b) => new Date(b.date) - new Date(a.date));

    tbody.innerHTML = sortedProbs.map(prob => `
      <tr>
        <td><strong>${prob.title}</strong></td>
        <td><span class="difficulty-badge ${prob.difficulty.toLowerCase()}">${prob.difficulty}</span></td>
        <td>${prob.platform}</td>
        <td>${prob.date}</td>
        <td>
          <div class="d-flex align-items-center gap-3">
            ${prob.url ? `<a href="${prob.url}" target="_blank" class="btn btn-sm btn-primary py-1 px-2" style="font-size:0.7rem"><i class="fa-solid fa-arrow-up-right-from-square"></i> Code</a>` : '<span class="text-muted">No Link</span>'}
            <i class="fa-regular fa-trash-can text-muted cursor-pointer" onclick="App.handleDSADelete('${prob.id}')"></i>
          </div>
        </td>
      </tr>
    `).join('');
  },

  calculateDSARank() {
    const solved = this.state.dsa.problems.length;
    let rank = DSA_RANKS[0];
    
    for (let i = 0; i < DSA_RANKS.length; i++) {
      if (solved >= DSA_RANKS[i].threshold) {
        rank = DSA_RANKS[i];
      } else {
        break;
      }
    }
    return rank;
  },

  calculateNextRank() {
    const solved = this.state.dsa.problems.length;
    for (let i = 0; i < DSA_RANKS.length; i++) {
      if (solved < DSA_RANKS[i].threshold) {
        return DSA_RANKS[i];
      }
    }
    return null; // Top Rank reached
  },

  handleDSALog(e) {
    e.preventDefault();
    const titleInput = document.getElementById('dsa-title');
    const diffInput = document.getElementById('dsa-difficulty');
    const platInput = document.getElementById('dsa-platform');
    const urlInput = document.getElementById('dsa-url');

    const title = titleInput.value.trim();
    const difficulty = diffInput.value;
    const platform = platInput.value;
    const url = urlInput.value.trim();

    if (!title) return;

    const newProblem = {
      id: 'dsa-' + Date.now(),
      title,
      difficulty,
      platform,
      url,
      date: this.getFormattedDate(new Date())
    };

    this.state.dsa.problems.push(newProblem);
    this.logActivity(`Solved DSA Problem: "${title}" (${difficulty})`, 'fa-code');
    this.triggerActivityProgress();
    this.saveState();

    // Reset Form
    titleInput.value = '';
    urlInput.value = '';

    this.renderDSA();
    this.updateGlobalHeaderElements();
  },

  handleDSADelete(probId) {
    const prob = this.state.dsa.problems.find(p => p.id === probId);
    if (!prob) return;

    if (confirm(`Delete solved log for "${prob.title}"?`)) {
      this.state.dsa.problems = this.state.dsa.problems.filter(p => p.id !== probId);
      this.logActivity(`Deleted DSA Problem: "${prob.title}"`, 'fa-trash-can');
      this.saveState();
      this.renderDSA();
      this.updateGlobalHeaderElements();
    }
  },

  // 5. NOTES VIEW
  activeNoteId: null,

  renderNotes() {
    const grid = document.getElementById('notes-grid');
    if (!grid) return;

    const searchVal = (document.getElementById('note-search')?.value || '').toLowerCase();
    
    // Filter notes
    const filteredNotes = this.state.notes.filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchVal) || 
                            note.content.toLowerCase().includes(searchVal) ||
                            note.tags.some(tag => tag.toLowerCase().includes(searchVal));
      return matchesSearch;
    });

    if (filteredNotes.length === 0) {
      grid.innerHTML = `
        <div class="glass-card text-center py-5 w-100 grid-col-span-all">
          <i class="fa-solid fa-note-sticky fa-3x mb-3 text-muted"></i>
          <p class="text-secondary">No notes found. Create some reminders or checklists.</p>
        </div>`;
      return;
    }

    grid.innerHTML = filteredNotes.map(note => {
      const truncated = note.content.replace(/\n/g, '<br>');
      
      return `
        <div class="glass-card note-card" style="--note-color: ${note.color || '#6366f1'}">
          <div class="note-body" onclick="App.openNoteEditorModal('${note.id}')">
            <h4 class="note-title">${note.title || 'Untitled Note'}</h4>
            <div class="note-snippet">${truncated}</div>
          </div>
          
          <div class="note-footer">
            <div class="note-tags">
              ${note.tags.map(t => `<span class="note-tag">${t}</span>`).join('')}
            </div>
            <div class="d-flex align-items-center gap-2">
              <i class="fa-regular fa-trash-can text-muted cursor-pointer hover-danger" onclick="App.handleNoteDelete('${note.id}')"></i>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  openNoteEditorModal(noteId = null) {
    const modal = document.getElementById('note-modal');
    const titleInput = document.getElementById('note-modal-title');
    const contentInput = document.getElementById('note-modal-content');
    const tagsInput = document.getElementById('note-modal-tags');
    
    this.activeNoteId = noteId;

    // Reset color dots
    const dots = document.querySelectorAll('.color-dot');
    dots.forEach(d => d.classList.remove('selected'));
    
    if (noteId) {
      // Edit mode
      const note = this.state.notes.find(n => n.id === noteId);
      if (note) {
        titleInput.value = note.title;
        contentInput.value = note.content;
        tagsInput.value = note.tags.join(', ');
        
        // Select color dot
        const matchingDot = document.querySelector(`.color-dot[data-color="${note.color}"]`);
        if (matchingDot) matchingDot.classList.add('selected');
      }
    } else {
      // Add mode
      titleInput.value = '';
      contentInput.value = '';
      tagsInput.value = '';
      dots[0].classList.add('selected'); // Default first color
    }

    modal.classList.add('active');
  },

  handleNoteSave() {
    const title = document.getElementById('note-modal-title').value.trim() || 'Untitled Note';
    const content = document.getElementById('note-modal-content').value;
    const tagsStr = document.getElementById('note-modal-tags').value;
    
    const tags = tagsStr.split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const selectedColorDot = document.querySelector('.color-dot.selected');
    const color = selectedColorDot ? selectedColorDot.getAttribute('data-color') : '#6366f1';

    if (this.activeNoteId) {
      // Update existing Note
      const note = this.state.notes.find(n => n.id === this.activeNoteId);
      if (note) {
        note.title = title;
        note.content = content;
        note.tags = tags;
        note.color = color;
        note.updatedAt = new Date().toISOString();
        this.logActivity(`Updated Note: "${title}"`, 'fa-note-sticky');
      }
    } else {
      // Create New Note
      const newNote = {
        id: 'note-' + Date.now(),
        title,
        content,
        tags,
        color,
        updatedAt: new Date().toISOString()
      };
      this.state.notes.unshift(newNote);
      this.logActivity(`Saved Note: "${title}"`, 'fa-note-sticky');
    }

    this.saveState();
    document.getElementById('note-modal').classList.remove('active');
    this.renderNotes();
    this.updateGlobalHeaderElements();
  },

  handleNoteDelete(noteId) {
    const note = this.state.notes.find(n => n.id === noteId);
    if (!note) return;

    if (confirm(`Are you sure you want to delete note "${note.title}"?`)) {
      this.state.notes = this.state.notes.filter(n => n.id !== noteId);
      this.logActivity(`Deleted Note: "${note.title}"`, 'fa-trash-can');
      this.saveState();
      this.renderNotes();
      this.updateGlobalHeaderElements();
    }
  },

  // 6. POMODORO TIMER & EXAMS (TOOLS VIEW)
  initTimerModule() {
    // Check settings in state
    if (!this.state.settings) {
      this.state.settings = { pomodoro: { focus: 25, short: 5, long: 15 } };
      this.saveState();
    }

    const timerSettings = this.state.settings.pomodoro;
    
    // Bind Pomodoro timer durations
    window.PomodoroTimer.updateDurations(
      timerSettings.focus || 25,
      timerSettings.short || 5,
      timerSettings.long || 15
    );

    // SVG Circular ring configuration
    const circle = document.querySelector('.timer-circle-progress');
    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    
    // Configure callbacks
    window.PomodoroTimer.init(
      // OnTick Callback
      (timeLeft, totalTime, mode) => {
        // Display Text
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        document.getElementById('timer-time-display').innerText = 
          `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // SVG Ring update
        const percent = timeLeft / totalTime;
        const offset = circumference - (percent * circumference);
        circle.style.strokeDashoffset = offset;

        // Custom ring colors depending on mode
        if (mode === 'focus') {
          circle.style.stroke = 'var(--accent-primary)';
        } else if (mode === 'short') {
          circle.style.stroke = 'var(--accent-success)';
        } else {
          circle.style.stroke = 'var(--accent-info)';
        }
      },
      // OnComplete Callback
      (completedMode) => {
        this.logActivity(`Timer Session Complete: ${completedMode.toUpperCase()}`, 'fa-clock');
        this.triggerActivityProgress();
        
        // Show status alerts, trigger automatic mode switches
        let nextMode = 'focus';
        let alertMsg = "Time's up! Time to focus.";
        if (completedMode === 'focus') {
          nextMode = 'short';
          alertMsg = "Focus session finished! Take a short break.";
        }

        alert(alertMsg);
        window.PomodoroTimer.setMode(nextMode);
        this.updateToolsTimerModeUI(nextMode);
      }
    );

    // DOM bindings for Timer controller buttons
    document.getElementById('timer-start').addEventListener('click', () => {
      window.PomodoroTimer.start();
      document.getElementById('timer-start').style.display = 'none';
      document.getElementById('timer-pause').style.display = 'inline-flex';
    });

    document.getElementById('timer-pause').addEventListener('click', () => {
      window.PomodoroTimer.pause();
      document.getElementById('timer-pause').style.display = 'none';
      document.getElementById('timer-start').style.display = 'inline-flex';
    });

    document.getElementById('timer-reset').addEventListener('click', () => {
      window.PomodoroTimer.reset();
      document.getElementById('timer-pause').style.display = 'none';
      document.getElementById('timer-start').style.display = 'inline-flex';
    });

    // Option Presets Focus / Breaks
    const timerModes = ['focus', 'short', 'long'];
    timerModes.forEach(mode => {
      document.getElementById(`timer-opt-${mode}`).addEventListener('click', () => {
        window.PomodoroTimer.setMode(mode);
        this.updateToolsTimerModeUI(mode);
        
        // Reset controls
        document.getElementById('timer-pause').style.display = 'none';
        document.getElementById('timer-start').style.display = 'inline-flex';
      });
    });
  },

  updateToolsTimerModeUI(activeMode) {
    const timerModes = ['focus', 'short', 'long'];
    timerModes.forEach(mode => {
      const btn = document.getElementById(`timer-opt-${mode}`);
      if (mode === activeMode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  },

  renderTools() {
    // Populate exams subjects list in form dropdown
    const examSubDropdown = document.getElementById('exam-subject');
    if (examSubDropdown) {
      examSubDropdown.innerHTML = '<option value="">-- Select Subject --</option>' + 
        this.state.subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    }

    // Render list of exams countdown
    this.renderExamsList();
  },

  renderExamsList() {
    const listContainer = document.getElementById('exams-list-container');
    if (!listContainer) return;

    if (this.state.exams.length === 0) {
      listContainer.innerHTML = `
        <div class="text-center py-5">
          <i class="fa-solid fa-hourglass-empty fa-3x mb-3 text-muted"></i>
          <p class="text-secondary">No exams added yet. Schedule your upcoming midterms and tests.</p>
        </div>`;
      return;
    }

    // Sort by date ascending
    const sortedExams = [...this.state.exams].sort((a,b) => new Date(a.date) - new Date(b.date));

    listContainer.innerHTML = sortedExams.map(ex => {
      const subject = this.state.subjects.find(s => s.id === ex.subjectId);
      const subName = subject ? subject.name : 'General';
      const formattedDate = new Date(ex.date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

      // We'll calculate countdown numbers
      const countdown = window.ExamCountdown.getTimeRemaining(ex.date);

      let criticalClass = countdown.isCritical ? 'critical' : '';
      let timerHTML = '';

      if (countdown.isPassed) {
        timerHTML = `<span class="text-muted font-weight-bold uppercase">Passed</span>`;
      } else {
        timerHTML = `
          <div class="countdown-digits-wrapper">
            <div class="countdown-unit">
              <span class="countdown-number" id="ex-${ex.id}-days">${countdown.days}</span>
              <span class="countdown-label">Days</span>
            </div>
            <div class="countdown-unit">
              <span class="countdown-number" id="ex-${ex.id}-hours">${window.ExamCountdown.formatDigit(countdown.hours)}</span>
              <span class="countdown-label">Hrs</span>
            </div>
            <div class="countdown-unit">
              <span class="countdown-number" id="ex-${ex.id}-mins">${window.ExamCountdown.formatDigit(countdown.minutes)}</span>
              <span class="countdown-label">Mins</span>
            </div>
            <div class="countdown-unit">
              <span class="countdown-number" id="ex-${ex.id}-secs">${window.ExamCountdown.formatDigit(countdown.seconds)}</span>
              <span class="countdown-label">Secs</span>
            </div>
          </div>
        `;
      }

      return `
        <div class="exam-countdown-card ${criticalClass}" data-exam-date="${ex.date}" data-exam-id="${ex.id}">
          <div class="exam-info">
            <h4 class="exam-name">${ex.name}</h4>
            <span class="exam-date-text"><i class="fa-solid fa-tag text-muted"></i> ${subName} | <i class="fa-regular fa-clock text-muted"></i> ${formattedDate}</span>
          </div>
          
          <div class="d-flex align-items-center gap-4">
            ${timerHTML}
            <i class="fa-regular fa-trash-can text-muted cursor-pointer hover-danger" onclick="App.handleExamDelete('${ex.id}')"></i>
          </div>
        </div>
      `;
    }).join('');
  },

  startCountdownTick() {
    // Every 1 second, re-calculate ticking times of exams visible on the screen
    setInterval(() => {
      const cards = document.querySelectorAll('.exam-countdown-card');
      cards.forEach(card => {
        const dateStr = card.getAttribute('data-exam-date');
        const examId = card.getAttribute('data-exam-id');
        const countdown = window.ExamCountdown.getTimeRemaining(dateStr);

        if (countdown.isPassed) {
          // Replace countdown block with Passed text
          const container = card.querySelector('.countdown-digits-wrapper');
          if (container) {
            container.outerHTML = `<span class="text-muted font-weight-bold uppercase">Passed</span>`;
          }
        } else {
          // Update individual numbers
          const d = document.getElementById(`ex-${examId}-days`);
          const h = document.getElementById(`ex-${examId}-hours`);
          const m = document.getElementById(`ex-${examId}-mins`);
          const s = document.getElementById(`ex-${examId}-secs`);

          if (d) d.innerText = countdown.days;
          if (h) h.innerText = window.ExamCountdown.formatDigit(countdown.hours);
          if (m) m.innerText = window.ExamCountdown.formatDigit(countdown.minutes);
          if (s) s.innerText = window.ExamCountdown.formatDigit(countdown.seconds);

          // If recently became critical, add critical CSS style
          if (countdown.isCritical) {
            card.classList.add('critical');
          }
        }
      });
    }, 1000);
  },

  handleExamCreate(e) {
    e.preventDefault();
    const nameInput = document.getElementById('exam-name');
    const dateInput = document.getElementById('exam-date');
    const subInput = document.getElementById('exam-subject');

    const name = nameInput.value.trim();
    const date = dateInput.value;
    const subjectId = subInput.value;

    if (!name || !date || !subjectId) {
      alert("Please fill in the Exam Name, Date, and Subject.");
      return;
    }

    const newExam = {
      id: 'exam-' + Date.now(),
      name,
      date,
      subjectId
    };

    this.state.exams.push(newExam);
    this.logActivity(`Scheduled Exam: "${name}"`, 'fa-hourglass');
    this.saveState();

    // Reset Form
    nameInput.value = '';
    dateInput.value = '';

    this.renderTools();
    this.updateGlobalHeaderElements();
  },

  handleExamDelete(examId) {
    const exam = this.state.exams.find(e => e.id === examId);
    if (!exam) return;

    if (confirm(`Cancel countdown for "${exam.name}"?`)) {
      this.state.exams = this.state.exams.filter(e => e.id !== examId);
      this.logActivity(`Cancelled Exam: "${exam.name}"`, 'fa-trash-can');
      this.saveState();
      this.renderTools();
      this.updateGlobalHeaderElements();
    }
  },

  // Helper Formats
  getFormattedDate(date) {
    return date.toISOString().split('T')[0];
  },

  formatRelativeTime(isoString) {
    try {
      const now = new Date();
      const past = new Date(isoString);
      const diffMs = now.getTime() - past.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      
      const diffHrs = Math.floor(diffMins / 60);
      if (diffHrs < 24) return `${diffHrs}h ago`;
      
      return past.toLocaleDateString();
    } catch (e) {
      return '';
    }
  }
};

window.App = App;

// Initializer
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
