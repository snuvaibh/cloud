/* =============================================================
   VELVET CRUMB — Dashboard JavaScript
   Login Auth + Blog CRUD via LocalStorage
   ============================================================= */

const CORRECT_USER = 'owner';
const CORRECT_PASS = 'velvetcrumb';
const STORAGE_KEY = 'velvetcrumb_posts';

// ─── DOM REFS ────────────────────────────────────────────────
const loginScreen = document.getElementById('login-screen');
const dashScreen = document.getElementById('dashboard-screen');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const loginError = document.getElementById('login-error');
const usernameInput = document.getElementById('dash-username');
const passwordInput = document.getElementById('dash-password');

const savePostBtn = document.getElementById('save-post-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const postList = document.getElementById('post-list');
const emptyState = document.getElementById('empty-state');
const statPosts = document.getElementById('stat-posts');
const formTitle = document.getElementById('form-title-label');
const editPostId = document.getElementById('edit-post-id');
const toast = document.getElementById('toast-msg');

const postTitleInput = document.getElementById('post-title');
const postCaptionInput = document.getElementById('post-caption');
const postTagInput = document.getElementById('post-tag');
const postEmojiInput = document.getElementById('post-emoji');


// ─── SESSION CHECK ───────────────────────────────────────────
if (sessionStorage.getItem('vcAuth') === 'true') {
    showDashboard();
}


// ─── LOGIN ───────────────────────────────────────────────────
loginBtn.addEventListener('click', handleLogin);
[usernameInput, passwordInput].forEach(el => {
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleLogin(); });
});

function handleLogin() {
    const uVal = usernameInput.value.trim();
    const pVal = passwordInput.value.trim();

    if (uVal === CORRECT_USER && pVal === CORRECT_PASS) {
        sessionStorage.setItem('vcAuth', 'true');
        loginError.classList.remove('visible');
        loginScreen.style.opacity = '0';
        loginScreen.style.transition = 'opacity 0.4s ease';
        setTimeout(() => {
            loginScreen.style.display = 'none';
            showDashboard();
        }, 400);
    } else {
        loginError.classList.add('visible');
        passwordInput.value = '';
        passwordInput.focus();
        // Shake animation
        loginBtn.style.animation = 'none';
        loginBtn.style.transform = 'translateX(-6px)';
        setTimeout(() => {
            loginBtn.style.transition = 'transform 0.4s ease';
            loginBtn.style.transform = '';
        }, 200);
    }
}

function showDashboard() {
    loginScreen.style.display = 'none';
    dashScreen.classList.add('visible');
    renderPosts();
    updateStats();
    setMonthLabel();
}


// ─── LOGOUT ──────────────────────────────────────────────────
logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('vcAuth');
    dashScreen.classList.remove('visible');
    loginScreen.style.display = 'flex';
    loginScreen.style.opacity = '0';
    setTimeout(() => { loginScreen.style.opacity = '1'; loginScreen.style.transition = 'opacity 0.4s ease'; }, 50);
    usernameInput.value = '';
    passwordInput.value = '';
});


// ─── STORAGE HELPERS ─────────────────────────────────────────
function getPosts() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch { return []; }
}

function savePosts(posts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}


// ─── CRUD OPERATIONS ──────────────────────────────────────────

// Save / Update
savePostBtn.addEventListener('click', () => {
    const title = postTitleInput.value.trim();
    const caption = postCaptionInput.value.trim();
    const tag = postTagInput.value.trim() || 'Journal';
    const emoji = postEmojiInput.value.trim() || '🧁';
    const editId = editPostId.value;

    if (!title) {
        postTitleInput.focus();
        postTitleInput.style.borderColor = 'var(--brown)';
        setTimeout(() => { postTitleInput.style.borderColor = ''; }, 1500);
        return;
    }

    const posts = getPosts();

    if (editId) {
        // Update existing
        const idx = posts.findIndex(p => p.id === editId);
        if (idx !== -1) {
            posts[idx] = { ...posts[idx], title, caption, tag, emoji, updatedAt: new Date().toISOString() };
        }
        showToast('✦ Post updated with love!');
    } else {
        // Create new
        posts.unshift({ id: generateId(), title, caption, tag, emoji, createdAt: new Date().toISOString() });
        showToast('✦ New post added beautifully!');
    }

    savePosts(posts);
    renderPosts();
    updateStats();
    resetForm();
});

// Cancel Edit
cancelEditBtn.addEventListener('click', resetForm);

function resetForm() {
    editPostId.value = '';
    postTitleInput.value = '';
    postCaptionInput.value = '';
    postTagInput.value = '';
    postEmojiInput.value = '';
    formTitle.textContent = 'Add New Blog Post';
    cancelEditBtn.style.display = 'none';
    savePostBtn.textContent = 'Save Post 🧁';
}

function editPost(id) {
    const post = getPosts().find(p => p.id === id);
    if (!post) return;

    editPostId.value = post.id;
    postTitleInput.value = post.title;
    postCaptionInput.value = post.caption || '';
    postTagInput.value = post.tag || '';
    postEmojiInput.value = post.emoji || '';
    formTitle.textContent = 'Edit Blog Post';
    cancelEditBtn.style.display = 'inline-flex';
    savePostBtn.textContent = 'Update Post 🧁';

    document.getElementById('post-form-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
    postTitleInput.focus();
}

function deletePost(id) {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    const posts = getPosts().filter(p => p.id !== id);
    savePosts(posts);
    renderPosts();
    updateStats();
    showToast('✦ Post removed.');
    if (editPostId.value === id) resetForm();
}


// ─── RENDER POSTS LIST ────────────────────────────────────────
function renderPosts() {
    const posts = getPosts();
    postList.innerHTML = '';

    if (posts.length === 0) {
        postList.innerHTML = `<p class="empty-state">No posts yet. Add your first one! 🌸</p>`;
        return;
    }

    posts.forEach(post => {
        const item = document.createElement('div');
        item.className = 'post-item';
        item.setAttribute('data-id', post.id);

        const dateStr = post.createdAt
            ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : '';

        item.innerHTML = `
      <div class="post-thumb" aria-label="${post.emoji || '🧁'}" role="img">${post.emoji || '🧁'}</div>
      <div class="post-info">
        <div class="post-info-title">${escHtml(post.title)}</div>
        <div class="post-info-caption">${escHtml(post.caption || '—')} &nbsp;• ${post.tag || 'Journal'} • ${dateStr}</div>
      </div>
      <div class="post-actions">
        <button class="btn-edit" aria-label="Edit post: ${escHtml(post.title)}" onclick="editPost('${post.id}')">Edit</button>
        <button class="btn-danger" aria-label="Delete post: ${escHtml(post.title)}" onclick="deletePost('${post.id}')">Delete</button>
      </div>
    `;

        postList.appendChild(item);
    });
}

function escHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}


// ─── STATS ────────────────────────────────────────────────────
function updateStats() {
    const count = getPosts().length;
    statPosts.textContent = count;
}

function setMonthLabel() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    document.getElementById('stat-month').textContent = months[new Date().getMonth()];
}

// Update greeting based on time
function setGreeting() {
    const h = new Date().getHours();
    const welcomeEl = document.querySelector('.dash-welcome');
    if (!welcomeEl) return;
    if (h < 12) welcomeEl.textContent = 'Good morning, Chef ☀️';
    else if (h < 18) welcomeEl.textContent = 'Good afternoon, Chef 🌤';
    else welcomeEl.textContent = 'Good evening, Chef ✨';
}
setGreeting();


// ─── TOAST ────────────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// Make edit/delete accessible globally (called from inline handlers)
window.editPost = editPost;
window.deletePost = deletePost;
