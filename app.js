const STORAGE_KEYS = {
  users: 'meow_users',
  posts: 'meow_posts',
  chats: 'meow_chats',
  notifications: 'meow_notifications',
  notices: 'meow_notices',
  settings: 'meow_settings',
  auth: 'meow_auth'
};

const APP_NAME = '🐱 냥집사 모임';

const DEFAULT_SETTINGS = {
  darkMode: false,
  notifications: true
};

const state = {
  screen: 'landing',
  tab: 'home',
  selectedBoard: 'all',
  searchQuery: '',
  selectedPostId: null,
  selectedChatId: null,
  profileFilter: 'mine',
  authUserId: getStorage(STORAGE_KEYS.auth, null),
  modal: null,
  settings: getStorage(STORAGE_KEYS.settings, DEFAULT_SETTINGS)
};

function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function getStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function setStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getUsers() {
  return getStorage(STORAGE_KEYS.users, []);
}

function saveUsers(users) {
  setStorage(STORAGE_KEYS.users, users);
}

function getPosts() {
  return getStorage(STORAGE_KEYS.posts, []);
}

function savePosts(posts) {
  setStorage(STORAGE_KEYS.posts, posts);
}

function getChats() {
  return getStorage(STORAGE_KEYS.chats, []);
}

function saveChats(chats) {
  setStorage(STORAGE_KEYS.chats, chats);
}

function getNotifications() {
  return getStorage(STORAGE_KEYS.notifications, []);
}

function saveNotifications(notifications) {
  setStorage(STORAGE_KEYS.notifications, notifications);
}

function getNotices() {
  return getStorage(STORAGE_KEYS.notices, []);
}

function saveNotices(notices) {
  setStorage(STORAGE_KEYS.notices, notices);
}

function getCurrentUser() {
  const users = getUsers();
  return users.find((user) => user.id === state.authUserId) || null;
}

function formatKoreanTime(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMinutes = Math.max(1, Math.round((now - date) / 60000));

  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  if (diffMinutes < 1440) return `${Math.round(diffMinutes / 60)}시간 전`;
  if (diffMinutes < 43200) return `${Math.round(diffMinutes / 1440)}일 전`;
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => {
    toast.classList.remove('show');
  }, 1800);
}

function getUnreadNotificationsCount() {
  const user = getCurrentUser();
  if (!user) return 0;
  return getNotifications().filter((item) => item.userId === user.id && !item.read).length;
}

function addNotification(userId, text, type = 'general') {
  const notifications = getNotifications();
  notifications.unshift({
    id: makeId('n'),
    userId,
    text,
    type,
    read: false,
    createdAt: new Date().toISOString()
  });
  saveNotifications(notifications);
}

function ensureSeedData() {
  if (!getStorage(STORAGE_KEYS.users, null)) {
    const users = [
      {
        id: 'u_admin',
        nickname: '냥집사관리자',
        email: 'admin@meow.com',
        password: 'admin123',
        bio: '고양이와 함께하는 커뮤니티를 관리하고 있어요.',
        avatar: '🐾',
        role: 'admin',
        isBanned: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'u_cho',
        nickname: '초코',
        email: 'cho@meow.com',
        password: '123456',
        bio: '둥글둥글 고양이와 함께 살고 있어요.',
        avatar: '🐱',
        role: 'user',
        isBanned: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'u_mimi',
        nickname: '미미',
        email: 'mimi@meow.com',
        password: '123456',
        bio: '사진 찍는 걸 좋아하는 집사입니다.',
        avatar: '🐈',
        role: 'user',
        isBanned: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'u_ba',
        nickname: '바둑이엄마',
        email: 'ba@meow.com',
        password: '123456',
        bio: '바둑이랑 매일 산책 중이에요.',
        avatar: '🐯',
        role: 'user',
        isBanned: false,
        createdAt: new Date().toISOString()
      }
    ];

    const posts = [
      {
        id: 'p_1',
        title: '오늘 저녁부터 고양이 간식 추천 부탁드려요',
        content: '우리 집 냥이는 닭가슴살 간식을 좋아하는데, 다른 건강한 간식 추천받고 싶어요. 고양이 영양도 생각해서 간식 고민 중입니다.',
        board: '정보게시판',
        authorId: 'u_cho',
        createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        views: 120,
        likedBy: ['u_mimi', 'u_ba'],
        comments: [
          { id: 'c_1', authorId: 'u_admin', content: '닭가슴살은 정말 좋아요. 소량씩 드셔야 해요.', createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString() },
          { id: 'c_2', authorId: 'u_ba', content: '저는 연어 비스킷이 잘 먹어요!', createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString() }
        ],
        reports: [],
        isAnnouncement: false
      },
      {
        id: 'p_2',
        title: '우리 집 고양이 첫 사진 자랑합니다',
        content: '오늘 아침 창가에서 햇살 받는 제 고양이 얼굴이 너무 예뻐서 사진 남겨요. 너무 귀엽지 않나요?',
        board: '고양이 자랑',
        authorId: 'u_cho',
        createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        views: 85,
        likedBy: ['u_admin', 'u_cho', 'u_mimi'],
        comments: [
          { id: 'c_3', authorId: 'u_mimi', content: '너무 귀엽네요! 저희 집 고양이랑 비슷해요.', createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString() }
        ],
        reports: [],
        isAnnouncement: false
      },
      {
        id: 'p_3',
        title: '방금 집 앞에서 냥이 발견했어요',
        content: '밖에서 길 잃은 고양이 한 마리를 발견해서 안전한 곳으로 데려갔어요. 다들 길 잃은 고양이를 보았을 때 어떻게 도와주나요?',
        board: '자유게시판',
        authorId: 'u_mimi',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        views: 46,
        likedBy: ['u_cho'],
        comments: [
          { id: 'c_4', authorId: 'u_ba', content: '동물보호센터에 연락하는 게 좋아요. 격려해요!', createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString() }
        ],
        reports: [],
        isAnnouncement: false
      },
      {
        id: 'p_4',
        title: '고양이 털 관리법 질문 있어요',
        content: '고양이 털이 많이 빠져서 고민인데, 브러싱이나 샴푸는 어떻게 해야 하나요? 도움이 되는 팁 있으면 공유 부탁드려요.',
        board: '질문게시판',
        authorId: 'u_ba',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
        views: 98,
        likedBy: ['u_admin', 'u_cho', 'u_mimi'],
        comments: [
          { id: 'c_5', authorId: 'u_admin', content: '주 2~3회 브러싱이 좋아요. 너무 자주 목욕은 피해야 합니다.', createdAt: new Date(Date.now() - 1000 * 60 * 28).toISOString() }
        ],
        reports: [],
        isAnnouncement: false
      },
      {
        id: 'p_5',
        title: '우리 집 고양이 미모 대방출',
        content: '새 장난감 소리만 들어도 반응하는데, 오늘은 혼자 앉아있는 모습이 너무 예뻤어요. 앉아있는 고양이 사진 찍으면서 행복했습니다.',
        board: '사진게시판',
        authorId: 'u_mimi',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        views: 134,
        likedBy: ['u_admin', 'u_cho', 'u_mimi', 'u_ba'],
        comments: [
          { id: 'c_6', authorId: 'u_cho', content: '완전 귀여워요~', createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() }
        ],
        reports: [],
        isAnnouncement: false
      }
    ];

    const chats = [
      {
        id: 'chat_1',
        participants: ['u_cho', 'u_admin'],
        messages: [
          { id: 'm_1', senderId: 'u_cho', text: '관리자님, 고양이 식단 질문이 있어요.', createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString() },
          { id: 'm_2', senderId: 'u_admin', text: '좋아요! 어떤 식단인지 알려주시면 추천해드릴게요.', createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString() }
        ]
      },
      {
        id: 'chat_2',
        participants: ['u_mimi', 'u_ba'],
        messages: [
          { id: 'm_3', senderId: 'u_ba', text: '저희 집 고양이도 사진 찍는 걸 좋아해요.', createdAt: new Date(Date.now() - 1000 * 60 * 28).toISOString() },
          { id: 'm_4', senderId: 'u_mimi', text: '너무 귀엽겠어요! 저도 같이 사진 찍고 싶어요.', createdAt: new Date(Date.now() - 1000 * 60 * 24).toISOString() }
        ]
      }
    ];

    const notifications = [
      {
        id: 'n_1',
        userId: 'u_cho',
        text: '누군가 내 게시글에 좋아요를 눌렀습니다.',
        type: 'like',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString()
      },
      {
        id: 'n_2',
        userId: 'u_cho',
        text: '새로운 댓글이 달렸습니다.',
        type: 'comment',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString()
      },
      {
        id: 'n_3',
        userId: 'u_mimi',
        text: '새로운 메시지가 도착했습니다.',
        type: 'message',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString()
      },
      {
        id: 'n_4',
        userId: 'u_ba',
        text: '관리자가 공지사항을 등록했습니다.',
        type: 'notice',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString()
      }
    ];

    const notices = [
      {
        id: 'notice_1',
        title: '커뮤니티 이용 규칙 안내',
        content: '고양이 사진과 정보 공유는 모두 환영합니다. 욕설이나 스팸은 삭제될 수 있습니다.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
      },
      {
        id: 'notice_2',
        title: '새로운 사진게시판 이벤트',
        content: '이번 주는 가장 귀여운 고양이 사진을 업로드해 보세요. 좋아요 많은 분들께 스티커를 드립니다.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString()
      }
    ];

    saveUsers(users);
    savePosts(posts);
    saveChats(chats);
    saveNotifications(notifications);
    saveNotices(notices);
    setStorage(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
  }
}

function getPostById(id) {
  return getPosts().find((post) => post.id === id) || null;
}

function getUserById(id) {
  return getUsers().find((user) => user.id === id) || null;
}

function getBoardList() {
  return ['all', '자유게시판', '고양이 자랑', '사진게시판', '정보게시판', '질문게시판'];
}

function getFilteredPosts() {
  const posts = getPosts();
  const query = state.searchQuery.trim().toLowerCase();
  const board = state.selectedBoard;

  return posts.filter((post) => {
    const boardMatches = board === 'all' || post.board === board;
    const queryMatches = !query || `${post.title} ${post.content}`.toLowerCase().includes(query);
    return boardMatches && queryMatches;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function renderLanding() {
  return `
    <div class="landing-screen">
      <div class="landing-card">
        <div class="logo-badge">🐱</div>
        <div class="app-name">${APP_NAME}</div>
        <p class="subtitle">「고양이를 사랑하는 사람들이 모이는 공간」</p>
        <button class="primary-btn" data-action="enter-app" style="width:100%;">입장하기</button>
      </div>
    </div>
  `;
}

function renderNavItem(tab, unreadCount) {
  const map = {
    home: { icon: '🏠', label: '홈' },
    board: { icon: '📝', label: '게시판' },
    chat: { icon: '💬', label: '채팅' },
    notify: { icon: '🔔', label: '알림' },
    profile: { icon: '👤', label: '프로필' }
  };
  const item = map[tab];
  const active = state.tab === tab ? 'active' : '';
  const badge = tab === 'notify' && unreadCount ? `<span class="nav-badge">${unreadCount > 9 ? '9+' : unreadCount}</span>` : '';

  return `
    <button class="nav-item ${active}" data-action="switch-tab" data-tab="${tab}">
      <span>${item.icon}</span>
      <span>${item.label}</span>
      ${badge}
    </button>
  `;
}

function renderAppLayout(content) {
  const currentUser = getCurrentUser();
  const unread = getUnreadNotificationsCount();

  return `
    <div class="mobile-shell">
      <header class="app-header">
        <div class="header-title">${APP_NAME}</div>
        <div class="header-actions">
          ${currentUser ? `<button class="small-btn" data-action="go-settings">설정</button>` : `<button class="small-btn" data-action="go-login">로그인</button>`}
        </div>
      </header>
      <main class="app-body">
        ${content}
      </main>
      <nav class="bottom-nav">
        ${['home', 'board', 'chat', 'notify', 'profile'].map((tab) => renderNavItem(tab, unread)).join('')}
      </nav>
    </div>
  `;
}

function renderPostCard(post) {
  const author = getUserById(post.authorId);
  const summary = post.content.length > 90 ? `${post.content.slice(0, 90)}...` : post.content;

  return `
    <div class="post-card" data-action="open-post" data-post-id="${post.id}">
      <h4>${escapeHtml(post.title)}</h4>
      <div class="post-meta">
        <span>${escapeHtml(author ? author.nickname : '익명')}</span>
        <span>${formatKoreanTime(post.createdAt)}</span>
      </div>
      <div class="post-summary">${escapeHtml(summary)}</div>
      <div class="inline-stats">
        <span>👁️ ${post.views || 0}</span>
        <span>❤️ ${post.likedBy ? post.likedBy.length : 0}</span>
        <span>💬 ${post.comments ? post.comments.length : 0}</span>
      </div>
    </div>
  `;
}

function renderHome() {
  const posts = getPosts().slice().sort((a, b) => (b.likedBy?.length || 0) - (a.likedBy?.length || 0));
  const recent = getPosts().slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);
  const notices = getNotices().slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 2);
  const userList = getUsers().filter((user) => user.id !== 'u_admin').slice(0, 3);

  return `
    <div class="screen">
      <div class="notice-banner">
        <div>
          <strong>관리자 공지사항</strong>
          <span>${notices[0] ? notices[0].title : '새 공지사항을 확인해보세요.'}</span>
        </div>
        <span>📣</span>
      </div>

      <div>
        <div class="section-header">
          <span>인기 게시글</span>
          <button class="ghost-btn" data-action="switch-tab" data-tab="board">더보기</button>
        </div>
        <div class="post-list">
          ${posts.slice(0, 3).map((post) => renderPostCard(post)).join('')}
        </div>
      </div>

      <div>
        <div class="section-header">
          <span>최근 게시글</span>
        </div>
        <div class="post-list">
          ${recent.map((post) => renderPostCard(post)).join('')}
        </div>
      </div>

      <div>
        <div class="section-header">
          <span>추천 냥집사</span>
        </div>
        <div class="notice-list">
          ${userList.map((user) => `
            <div class="notice-item">
              <div class="notification-head">
                <div style="display:flex;align-items:center;gap:10px;">
                  <div class="avatar-ring" style="width:42px;height:42px;font-size:1.3rem;">${escapeHtml(user.avatar || '🐱')}</div>
                  <div>
                    <strong>${escapeHtml(user.nickname)}</strong>
                    <p>${escapeHtml(user.bio || '고양이와 함께하는 집사')}</p>
                  </div>
                </div>
                <span class="badge">추천</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div>
        <div class="section-header">
          <span>공지사항</span>
        </div>
        <div class="notice-list">
          ${notices.map((notice) => `
            <div class="notice-item">
              <strong>${escapeHtml(notice.title)}</strong>
              <p>${escapeHtml(notice.content)}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderBoard() {
  const posts = getFilteredPosts();
  const boardList = getBoardList();

  return `
    <div class="screen">
      <div class="search-box">
        <span>🔍</span>
        <input type="text" value="${escapeHtml(state.searchQuery)}" placeholder="게시글을 검색해보세요" data-role="board-search" />
      </div>

      <div class="board-tabs">
        ${boardList.map((board) => `
          <button class="filter-pill ${board === state.selectedBoard ? 'active' : ''}" data-action="set-board" data-board="${board}">
            ${board === 'all' ? '전체' : board}
          </button>
        `).join('')}
      </div>

      <div class="toolbar-row">
        <div class="section-header" style="margin:0;">
          <span>${state.selectedBoard === 'all' ? '전체 게시글' : state.selectedBoard}</span>
        </div>
        <button class="write-btn" data-action="open-post-create">글쓰기</button>
      </div>

      <div class="post-list">
        ${posts.length ? posts.map((post) => renderPostCard(post)).join('') : `<div class="empty-box">검색 결과가 없어요. 다른 키워드로 다시 찾아보세요.</div>`}
      </div>
    </div>
  `;
}

function renderPostDetail(postId) {
  const post = getPostById(postId);
  if (!post) {
    return `<div class="empty-box">게시글을 찾을 수 없습니다.</div>`;
  }

  const author = getUserById(post.authorId);
  const currentUser = getCurrentUser();
  const likedByCurrentUser = !!(currentUser && post.likedBy && post.likedBy.includes(currentUser.id));

  return `
    <div class="detail-screen">
      <button class="small-btn" data-action="go-board" style="align-self:flex-start;">← 게시판으로</button>
      <div class="detail-card">
        <div class="detail-meta">
          <span>${escapeHtml(author ? author.nickname : '익명')}</span>
          <span>${formatKoreanTime(post.createdAt)}</span>
        </div>
        <h2>${escapeHtml(post.title)}</h2>
        <div class="detail-meta">
          <span>게시판 · ${escapeHtml(post.board)}</span>
          <span>조회수 ${post.views || 0}</span>
        </div>
        <p>${escapeHtml(post.content)}</p>

        <div class="detail-actions">
          <button data-action="toggle-like" data-post-id="${post.id}" class="${likedByCurrentUser ? 'active' : ''}">❤️ ${post.likedBy ? post.likedBy.length : 0}</button>
          <button data-action="focus-comment">💬 ${post.comments ? post.comments.length : 0}</button>
          <button data-action="share-post" data-post-id="${post.id}">🔗 공유</button>
          <button data-action="report-post" data-post-id="${post.id}">🚨 신고</button>
        </div>
      </div>

      <div class="detail-card">
        <div class="section-header" style="margin:0 0 10px;">
          <span>댓글</span>
        </div>
        <div class="comment-list">
          ${post.comments && post.comments.length ? post.comments.map((comment) => {
            const commentUser = getUserById(comment.authorId);
            return `
              <div class="comment-item">
                <strong>${escapeHtml(commentUser ? commentUser.nickname : '익명')}</strong>
                <p>${escapeHtml(comment.content)}</p>
              </div>
            `;
          }).join('') : `<div class="empty-box">아직 댓글이 없어요. 첫 댓글을 남겨보세요.</div>`}
        </div>
      </div>

      <div class="detail-card">
        <form class="comment-form" data-role="comment-form" data-post-id="${post.id}">
          <input type="text" name="comment" placeholder="댓글을 작성해보세요" required />
          <button class="primary-btn" type="submit">등록</button>
        </form>
      </div>
    </div>
  `;
}

function renderChat() {
  const currentUser = getCurrentUser();
  const chats = getChats().filter((chat) => chat.participants.includes(currentUser?.id || ''));
  const selectedChat = chats.find((chat) => chat.id === state.selectedChatId) || chats[0] || null;

  return `
    <div class="screen">
      <div class="chat-layout">
        <div class="chat-header-row">
          <div class="section-header" style="margin:0;">
            <span>채팅</span>
          </div>
          <button class="small-btn" data-action="new-chat">새 채팅</button>
        </div>

        <div class="chat-list">
          ${chats.length ? chats.map((chat) => {
            const friendId = chat.participants.find((id) => id !== currentUser?.id);
            const friend = getUserById(friendId);
            const lastMessage = chat.messages[chat.messages.length - 1];
            return `
              <div class="chat-row" data-action="select-chat" data-chat-id="${chat.id}">
                <strong>${escapeHtml(friend ? friend.nickname : '테스트 유저')}</strong>
                <p>${escapeHtml(lastMessage ? lastMessage.text : '대화가 시작되지 않았습니다.')}</p>
              </div>
            `;
          }).join('') : `<div class="empty-box">대화가 아직 없어요. 새 채팅을 시작해보세요.</div>`}
        </div>

        ${selectedChat ? `
          <div class="chat-thread">
            ${selectedChat.messages.map((message) => {
              const self = message.senderId === currentUser?.id;
              return `<div class="chat-bubble ${self ? 'me' : 'other'}">${escapeHtml(message.text)}</div>`;
            }).join('')}
          </div>
          <form class="chat-input-row" data-role="chat-form" data-chat-id="${selectedChat.id}">
            <input type="text" name="message" placeholder="메시지를 입력하세요" required />
            <button class="primary-btn" type="submit">전송</button>
          </form>
        ` : `<div class="empty-box">채팅 상대를 선택해보세요.</div>`}
      </div>
    </div>
  `;
}

function renderNotifications() {
  const currentUser = getCurrentUser();
  const items = getNotifications().filter((item) => !currentUser || item.userId === currentUser.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return `
    <div class="screen">
      <div class="toolbar-row">
        <div class="section-header" style="margin:0;">
          <span>알림</span>
        </div>
        <button class="small-btn" data-action="mark-all-read">모두 읽음</button>
      </div>

      <div class="notification-list">
        ${items.length ? items.map((item) => `
          <div class="notification-item ${item.read ? '' : 'unread'}">
            <div class="notification-head">
              <strong>${escapeHtml(item.type === 'message' ? '메시지' : item.type === 'like' ? '좋아요' : item.type === 'comment' ? '댓글' : '공지')}</strong>
              <span>${item.read ? '읽음' : '새 알림'}</span>
            </div>
            <p>${escapeHtml(item.text)}</p>
          </div>
        `).join('') : `<div class="empty-box">새로운 알림이 아직 없어요.</div>`}
      </div>
    </div>
  `;
}

function renderProfilePostItem(post) {
  const author = getUserById(post.authorId);
  return `
    <div class="notice-item" data-action="open-post" data-post-id="${post.id}">
      <strong>${escapeHtml(post.title)}</strong>
      <p>${escapeHtml(author ? author.nickname : '익명')} · ${formatKoreanTime(post.createdAt)}</p>
    </div>
  `;
}

function renderProfile(currentUser) {
  if (!currentUser) {
    return `
      <div class="screen">
        <div class="empty-box">
          로그인 후 내 프로필을 볼 수 있어요.
          <div style="margin-top:12px;">
            <button class="primary-btn" data-action="go-login">로그인</button>
          </div>
        </div>
      </div>
    `;
  }

  const posts = getPosts().filter((post) => post.authorId === currentUser.id);
  const likedPosts = getPosts().filter((post) => (post.likedBy || []).includes(currentUser.id));
  const totalLikes = posts.reduce((sum, post) => sum + ((post.likedBy || []).length), 0);

  return `
    <div class="screen">
      <div class="profile-header">
        <div class="avatar-ring">${escapeHtml(currentUser.avatar || '🐱')}</div>
        <div class="profile-meta">
          <h3>${escapeHtml(currentUser.nickname)}</h3>
          <p class="profile-bio">${escapeHtml(currentUser.bio || '자기소개를 작성해보세요.')}</p>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-box">
          <strong>${posts.length}</strong>
          <span>작성한 게시글</span>
        </div>
        <div class="stat-box">
          <strong>${totalLikes}</strong>
          <span>받은 좋아요</span>
        </div>
        <div class="stat-box">
          <strong>${likedPosts.length}</strong>
          <span>좋아요한 글</span>
        </div>
      </div>

      <div class="grid-actions">
        <button data-action="open-profile-edit">프로필 수정</button>
        <button data-action="show-my-posts">내 게시글</button>
        <button data-action="show-liked-posts">좋아요한 게시글</button>
        <button data-action="go-settings">설정</button>
        ${currentUser.role === 'admin' ? '<button data-action="go-admin">관리자</button>' : ''}
      </div>

      <div class="notice-list">
        ${state.profileFilter === 'mine' ? posts.map((post) => renderProfilePostItem(post)).join('') : likedPosts.map((post) => renderProfilePostItem(post)).join('')}
      </div>
    </div>
  `;
}

function renderSettings() {
  const currentUser = getCurrentUser();
  return `
    <div class="screen">
      <div class="section-header">
        <span>설정</span>
      </div>
      <div class="notice-list">
        <button class="action-button" data-action="open-profile-edit">프로필 수정</button>
        <button class="action-button" data-action="toggle-notifications">알림 설정: ${state.settings.notifications ? '켜짐' : '꺼짐'}</button>
        <button class="action-button" data-action="toggle-darkmode">다크모드: ${state.settings.darkMode ? '켜짐' : '꺼짐'}</button>
        <button class="action-button" data-action="privacy-setting">개인정보 설정</button>
        ${currentUser ? `<button class="danger-btn" data-action="logout" style="width:100%;margin-top:8px;">로그아웃</button>` : `<button class="primary-btn" data-action="go-login" style="width:100%;margin-top:8px;">로그인</button>`}
      </div>
    </div>
  `;
}

function renderAdmin() {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return `
      <div class="screen">
        <div class="empty-box">관리자만 접근할 수 있는 화면입니다.</div>
      </div>
    `;
  }

  const posts = getPosts();
  const users = getUsers();

  return `
    <div class="screen">
      <div class="section-header">
        <span>관리자 페이지</span>
      </div>

      <div class="notice-list">
        <div class="notice-item">
          <strong>게시글 삭제</strong>
          ${posts.map((post) => `
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:10px;">
              <div>
                <strong>${escapeHtml(post.title)}</strong>
                <p>${escapeHtml(post.board)}</p>
              </div>
              <button class="danger-btn" data-action="delete-post" data-post-id="${post.id}">삭제</button>
            </div>
          `).join('')}
        </div>

        <div class="notice-item">
          <strong>댓글 삭제</strong>
          ${posts.flatMap((post) => (post.comments || []).map((comment) => `
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:10px;">
              <div>
                <strong>${escapeHtml(post.title)}</strong>
                <p>${escapeHtml(comment.content)}</p>
              </div>
              <button class="danger-btn" data-action="delete-comment" data-post-id="${post.id}" data-comment-id="${comment.id}">삭제</button>
            </div>
          `)).join('') || '<p>댓글이 없습니다.</p>'}
        </div>

        <div class="notice-item">
          <strong>사용자 관리</strong>
          ${users.map((user) => `
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:10px;">
              <div>
                <strong>${escapeHtml(user.nickname)}</strong>
                <p>${escapeHtml(user.email)}</p>
              </div>
              <button class="small-btn" data-action="toggle-user-ban" data-user-id="${user.id}">${user.isBanned ? '차단 해제' : '차단'}</button>
            </div>
          `).join('')}
        </div>

        <div class="notice-item">
          <strong>공지사항 작성</strong>
          <form class="form-grid" data-role="admin-notice-form">
            <div class="form-field">
              <label>제목</label>
              <input type="text" name="noticeTitle" required />
            </div>
            <div class="form-field">
              <label>내용</label>
              <textarea name="noticeContent" required></textarea>
            </div>
            <div class="form-actions">
              <button class="primary-btn" type="submit">등록</button>
            </div>
          </form>
        </div>

        <div class="notice-item">
          <strong>신고된 게시글</strong>
          ${posts.filter((post) => (post.reports || []).length > 0).length ? posts.filter((post) => (post.reports || []).length > 0).map((post) => `
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:10px;">
              <div>
                <strong>${escapeHtml(post.title)}</strong>
                <p>신고 수: ${(post.reports || []).length}</p>
              </div>
              <button class="small-btn" data-action="clear-report" data-post-id="${post.id}">확인</button>
            </div>
          `).join('') : '<p>신고된 게시글이 없습니다.</p>'}
        </div>
      </div>
    </div>
  `;
}

function renderLogin() {
  return `
    <div class="landing-screen">
      <div class="modal-panel" style="width:min(100%, 360px);">
        <h3>로그인</h3>
        <form class="form-grid" data-role="login-form">
          <div class="form-field">
            <label>이메일</label>
            <input type="email" name="email" placeholder="meow@sample.com" required />
          </div>
          <div class="form-field">
            <label>비밀번호</label>
            <input type="password" name="password" required />
          </div>
          <div class="form-actions">
            <button class="small-btn" type="button" data-action="go-signup">회원가입</button>
            <button class="primary-btn" type="submit">로그인</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderSignup() {
  return `
    <div class="landing-screen">
      <div class="modal-panel" style="width:min(100%, 360px);">
        <h3>회원가입</h3>
        <form class="form-grid" data-role="signup-form">
          <div class="form-field">
            <label>닉네임</label>
            <input type="text" name="nickname" placeholder="냥집사" required />
          </div>
          <div class="form-field">
            <label>이메일</label>
            <input type="email" name="email" placeholder="meow@sample.com" required />
          </div>
          <div class="form-field">
            <label>비밀번호</label>
            <input type="password" name="password" required />
          </div>
          <div class="form-actions">
            <button class="small-btn" type="button" data-action="go-login">로그인</button>
            <button class="primary-btn" type="submit">가입하기</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderModal() {
  if (!state.modal) return '';

  if (state.modal === 'post-create') {
    return `
      <div class="modal-overlay">
        <div class="modal-panel">
          <h3>게시글 작성</h3>
          <form class="form-grid" data-role="post-form">
            <div class="form-field">
              <label>제목</label>
              <input type="text" name="title" placeholder="제목을 입력하세요" required />
            </div>
            <div class="form-field">
              <label>내용</label>
              <textarea name="content" placeholder="내용을 입력하세요" required></textarea>
            </div>
            <div class="form-field">
              <label>게시판 선택</label>
              <select name="board">
                <option value="자유게시판">자유게시판</option>
                <option value="고양이 자랑">고양이 자랑</option>
                <option value="사진게시판">사진게시판</option>
                <option value="정보게시판">정보게시판</option>
                <option value="질문게시판">질문게시판</option>
              </select>
            </div>
            <div class="form-field">
              <label>이미지 선택</label>
              <input type="file" accept="image/*" />
            </div>
            <div class="form-actions">
              <button type="button" class="small-btn" data-action="close-modal">취소</button>
              <button type="submit" class="primary-btn">등록</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  if (state.modal === 'profile-edit') {
    const currentUser = getCurrentUser();
    if (!currentUser) return '';
    return `
      <div class="modal-overlay">
        <div class="modal-panel">
          <h3>프로필 수정</h3>
          <form class="form-grid" data-role="profile-edit-form">
            <div class="form-field">
              <label>닉네임</label>
              <input type="text" name="nickname" value="${escapeHtml(currentUser.nickname)}" required />
            </div>
            <div class="form-field">
              <label>자기소개</label>
              <textarea name="bio" placeholder="자기소개를 입력하세요">${escapeHtml(currentUser.bio || '')}</textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="small-btn" data-action="close-modal">취소</button>
              <button type="submit" class="primary-btn">저장</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  return '';
}

function openPost(postId) {
  const posts = getPosts();
  const postIndex = posts.findIndex((post) => post.id === postId);
  if (postIndex === -1) return;
  posts[postIndex].views = (posts[postIndex].views || 0) + 1;
  savePosts(posts);
  state.selectedPostId = postId;
  state.screen = 'app';
  state.tab = 'board';
  render();
}

function handleLoginSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const email = form.email.value.trim();
  const password = form.password.value.trim();

  const users = getUsers();
  const found = users.find((user) => user.email === email && user.password === password);

  if (!found) {
    showToast('이메일 또는 비밀번호를 확인해 주세요.');
    return;
  }

  if (found.isBanned) {
    showToast('차단된 계정입니다. 관리자에게 문의해 주세요.');
    return;
  }

  state.authUserId = found.id;
  setStorage(STORAGE_KEYS.auth, found.id);
  state.screen = 'app';
  state.tab = 'home';
  state.selectedPostId = null;
  render();
  showToast(`${found.nickname}님 환영합니다!`);
}

function handleSignupSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const nickname = form.nickname.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value.trim();

  if (!nickname || !email || !password) {
    showToast('모든 정보를 입력해 주세요.');
    return;
  }

  const users = getUsers();
  if (users.some((user) => user.email === email)) {
    showToast('이미 가입된 이메일입니다.');
    return;
  }

  const newUser = {
    id: makeId('u'),
    nickname,
    email,
    password,
    bio: '새로 가입한 냥집사입니다.',
    avatar: '🐱',
    role: 'user',
    isBanned: false,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);
  state.authUserId = newUser.id;
  setStorage(STORAGE_KEYS.auth, newUser.id);
  state.screen = 'app';
  state.tab = 'profile';
  render();
  showToast('회원가입이 완료되었습니다.');
}

function handleOpenWritePost() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showToast('로그인 후 게시글을 작성할 수 있어요.');
    return;
  }

  state.modal = 'post-create';
  render();
}

function handleCreatePost(event) {
  event.preventDefault();
  const form = event.target;
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showToast('로그인 후 게시글을 작성할 수 있어요.');
    return;
  }

  const title = form.title.value.trim();
  const content = form.content.value.trim();
  const board = form.board.value;

  if (!title || !content) {
    showToast('제목과 내용을 입력해 주세요.');
    return;
  }

  const posts = getPosts();
  posts.unshift({
    id: makeId('p'),
    title,
    content,
    board,
    authorId: currentUser.id,
    createdAt: new Date().toISOString(),
    views: 0,
    likedBy: [],
    comments: [],
    reports: [],
    isAnnouncement: false
  });
  savePosts(posts);
  state.modal = null;
  state.selectedBoard = board;
  state.tab = 'board';
  render();
  showToast('게시글이 등록되었습니다.');
}

function handleBoardSearch(event) {
  state.searchQuery = event.target.value;
  render();
}

function handleSetBoard(board) {
  state.selectedBoard = board;
  render();
}

function handleLikeToggle(postId) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showToast('로그인 후 좋아요를 누를 수 있어요.');
    return;
  }

  const posts = getPosts();
  const post = posts.find((item) => item.id === postId);
  if (!post) return;

  if (!post.likedBy) post.likedBy = [];
  const exists = post.likedBy.includes(currentUser.id);

  if (exists) {
    post.likedBy = post.likedBy.filter((userId) => userId !== currentUser.id);
    showToast('좋아요를 취소했습니다.');
  } else {
    post.likedBy.push(currentUser.id);
    addNotification(post.authorId, '누군가 내 게시글에 좋아요를 눌렀습니다.', 'like');
    showToast('좋아요를 눌렀습니다.');
  }

  savePosts(posts);
  render();
}

function handleCommentSubmit(event) {
  event.preventDefault();
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showToast('로그인 후 댓글을 작성할 수 있어요.');
    return;
  }

  const form = event.target;
  const postId = form.dataset.postId;
  const content = form.comment.value.trim();
  if (!content) {
    showToast('댓글 내용을 입력해 주세요.');
    return;
  }

  const posts = getPosts();
  const post = posts.find((item) => item.id === postId);
  if (!post) return;

  post.comments = post.comments || [];
  post.comments.push({
    id: makeId('c'),
    authorId: currentUser.id,
    content,
    createdAt: new Date().toISOString()
  });

  if (post.authorId !== currentUser.id) {
    addNotification(post.authorId, '새로운 댓글이 달렸습니다.', 'comment');
  }

  savePosts(posts);
  render();
}

function handleSharePost(postId) {
  const url = `${window.location.origin}${window.location.pathname}#post-${postId}`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => {
      showToast('링크가 복사되었습니다.');
    });
    return;
  }
  showToast('링크를 복사할 수 없었습니다.');
}

function handleReportPost(postId) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showToast('로그인 후 신고할 수 있어요.');
    return;
  }

  const posts = getPosts();
  const post = posts.find((item) => item.id === postId);
  if (!post) return;
  post.reports = post.reports || [];
  post.reports.push(currentUser.id);
  savePosts(posts);
  showToast('신고가 접수되었습니다.');
}

function handleSendMessage(event) {
  event.preventDefault();
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showToast('로그인 후 채팅을 이용할 수 있어요.');
    return;
  }

  const chatId = event.target.dataset.chatId;
  const messageText = event.target.message.value.trim();
  if (!messageText) {
    showToast('메시지를 입력해 주세요.');
    return;
  }

  const chats = getChats();
  const chat = chats.find((item) => item.id === chatId);
  if (!chat) return;

  chat.messages.push({
    id: makeId('m'),
    senderId: currentUser.id,
    text: messageText,
    createdAt: new Date().toISOString()
  });
  saveChats(chats);
  const receiverId = chat.participants.find((id) => id !== currentUser.id);
  if (receiverId) {
    addNotification(receiverId, '새로운 메시지가 도착했습니다.', 'message');
  }
  render();
}

function handleNewChat() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showToast('로그인 후 채팅을 이용할 수 있어요.');
    return;
  }

  const users = getUsers().filter((user) => user.id !== currentUser.id && !user.isBanned);
  const promptValue = window.prompt(`테스트 사용자 선택: ${users.map((user) => user.nickname).join(', ')}`);
  if (!promptValue) return;

  const target = users.find((user) => user.nickname === promptValue || user.email === promptValue);
  if (!target) {
    showToast('해당 사용자 이름을 찾을 수 없어요.');
    return;
  }

  const chats = getChats();
  const existing = chats.find((chat) => chat.participants.includes(currentUser.id) && chat.participants.includes(target.id));
  if (existing) {
    state.selectedChatId = existing.id;
    state.tab = 'chat';
    render();
    return;
  }

  const newChat = {
    id: makeId('chat'),
    participants: [currentUser.id, target.id],
    messages: [{
      id: makeId('m'),
      senderId: target.id,
      text: `${target.nickname}님과의 대화가 시작되었습니다.`,
      createdAt: new Date().toISOString()
    }]
  };
  chats.push(newChat);
  saveChats(chats);
  state.selectedChatId = newChat.id;
  state.tab = 'chat';
  render();
}

function handleMarkAllRead() {
  const notifications = getNotifications().map((item) => ({ ...item, read: true }));
  saveNotifications(notifications);
  render();
}

function handleToggleNotifications() {
  state.settings.notifications = !state.settings.notifications;
  setStorage(STORAGE_KEYS.settings, state.settings);
  render();
}

function handleToggleDarkMode() {
  state.settings.darkMode = !state.settings.darkMode;
  setStorage(STORAGE_KEYS.settings, state.settings);
  render();
}

function handleProfileEdit() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  state.modal = 'profile-edit';
  render();
}

function handleProfileEditSubmit(event) {
  event.preventDefault();
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  const nickname = event.target.nickname.value.trim();
  const bio = event.target.bio.value.trim();
  const users = getUsers();
  const target = users.find((user) => user.id === currentUser.id);
  if (!target) return;
  target.nickname = nickname || target.nickname;
  target.bio = bio || target.bio;
  saveUsers(users);
  state.modal = null;
  render();
  showToast('프로필이 수정되었습니다.');
}

function handleLogout() {
  state.authUserId = null;
  localStorage.removeItem(STORAGE_KEYS.auth);
  state.screen = 'landing';
  state.tab = 'home';
  render();
}

function handleShowMyPosts() {
  state.profileFilter = 'mine';
  state.tab = 'profile';
  render();
}

function handleShowLikedPosts() {
  state.profileFilter = 'liked';
  state.tab = 'profile';
  render();
}

function handleAdminNoticeSubmit(event) {
  event.preventDefault();
  const title = event.target.noticeTitle.value.trim();
  const content = event.target.noticeContent.value.trim();
  if (!title || !content) {
    showToast('공지사항 제목과 내용을 입력해 주세요.');
    return;
  }
  const notices = getNotices();
  notices.unshift({
    id: makeId('notice'),
    title,
    content,
    createdAt: new Date().toISOString()
  });
  saveNotices(notices);
  event.target.reset();
  render();
  showToast('공지사항이 등록되었습니다.');
}

function handleDeletePost(postId) {
  let posts = getPosts();
  posts = posts.filter((post) => post.id !== postId);
  savePosts(posts);
  render();
}

function handleDeleteComment(postId, commentId) {
  const posts = getPosts();
  const post = posts.find((item) => item.id === postId);
  if (!post) return;
  post.comments = (post.comments || []).filter((comment) => comment.id !== commentId);
  savePosts(posts);
  render();
}

function handleToggleUserBan(userId) {
  const users = getUsers();
  const target = users.find((user) => user.id === userId);
  if (!target) return;
  target.isBanned = !target.isBanned;
  saveUsers(users);
  render();
}

function handleClearReport(postId) {
  const posts = getPosts();
  const post = posts.find((item) => item.id === postId);
  if (!post) return;
  post.reports = [];
  savePosts(posts);
  render();
}

function render() {
  document.body.classList.toggle('dark-mode', !!state.settings.darkMode);

  if (state.screen === 'landing') {
    document.getElementById('app').innerHTML = renderLanding();
    return;
  }

  if (state.screen === 'login') {
    document.getElementById('app').innerHTML = renderLogin();
    return;
  }

  if (state.screen === 'signup') {
    document.getElementById('app').innerHTML = renderSignup();
    return;
  }

  if (state.screen === 'settings') {
    document.getElementById('app').innerHTML = renderAppLayout(renderSettings()) + renderModal();
    return;
  }

  if (state.screen === 'admin') {
    document.getElementById('app').innerHTML = renderAppLayout(renderAdmin()) + renderModal();
    return;
  }

  if (state.selectedPostId) {
    document.getElementById('app').innerHTML = renderAppLayout(renderPostDetail(state.selectedPostId)) + renderModal();
    return;
  }

  const currentUser = getCurrentUser();
  const tabContentMap = {
    home: renderHome(),
    board: renderBoard(),
    chat: renderChat(),
    notify: renderNotifications(),
    profile: renderProfile(currentUser)
  };

  document.getElementById('app').innerHTML = renderAppLayout(tabContentMap[state.tab] || renderHome()) + renderModal();
}

function bindEvents() {
  document.addEventListener('click', (event) => {
    const target = event.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;
    const postId = target.dataset.postId;
    const board = target.dataset.board;
    const chatId = target.dataset.chatId;
    const userId = target.dataset.userId;
    const commentId = target.dataset.commentId;

    switch (action) {
      case 'enter-app':
        state.screen = 'app';
        state.tab = 'home';
        render();
        break;
      case 'switch-tab':
        state.tab = target.dataset.tab;
        state.selectedPostId = null;
        render();
        break;
      case 'go-login':
        state.screen = 'login';
        render();
        break;
      case 'go-signup':
        state.screen = 'signup';
        render();
        break;
      case 'go-settings':
        state.screen = 'settings';
        render();
        break;
      case 'go-admin':
        state.screen = 'admin';
        render();
        break;
      case 'go-board':
        state.selectedPostId = null;
        state.tab = 'board';
        render();
        break;
      case 'open-post-create':
        handleOpenWritePost();
        break;
      case 'set-board':
        handleSetBoard(board);
        break;
      case 'open-post':
        if (postId) openPost(postId);
        break;
      case 'toggle-like':
        if (postId) handleLikeToggle(postId);
        break;
      case 'focus-comment':
        const input = document.querySelector('input[name="comment"]');
        if (input) input.focus();
        break;
      case 'share-post':
        if (postId) handleSharePost(postId);
        break;
      case 'report-post':
        if (postId) handleReportPost(postId);
        break;
      case 'new-chat':
        handleNewChat();
        break;
      case 'select-chat':
        state.selectedChatId = chatId;
        state.tab = 'chat';
        render();
        break;
      case 'mark-all-read':
        handleMarkAllRead();
        break;
      case 'toggle-notifications':
        handleToggleNotifications();
        break;
      case 'toggle-darkmode':
        handleToggleDarkMode();
        break;
      case 'privacy-setting':
        showToast('개인정보 설정 기능은 준비 중입니다.');
        break;
      case 'logout':
        handleLogout();
        break;
      case 'open-profile-edit':
        handleProfileEdit();
        break;
      case 'show-my-posts':
        handleShowMyPosts();
        break;
      case 'show-liked-posts':
        handleShowLikedPosts();
        break;
      case 'delete-post':
        if (postId) handleDeletePost(postId);
        break;
      case 'delete-comment':
        if (postId && commentId) handleDeleteComment(postId, commentId);
        break;
      case 'toggle-user-ban':
        if (userId) handleToggleUserBan(userId);
        break;
      case 'clear-report':
        if (postId) handleClearReport(postId);
        break;
      case 'close-modal':
        state.modal = null;
        render();
        break;
      default:
        break;
    }
  });

  document.addEventListener('submit', (event) => {
    const role = event.target.dataset.role;
    if (role === 'login-form') {
      handleLoginSubmit(event);
      return;
    }
    if (role === 'signup-form') {
      handleSignupSubmit(event);
      return;
    }
    if (role === 'post-form') {
      handleCreatePost(event);
      return;
    }
    if (role === 'comment-form') {
      handleCommentSubmit(event);
      return;
    }
    if (role === 'chat-form') {
      handleSendMessage(event);
      return;
    }
    if (role === 'admin-notice-form') {
      handleAdminNoticeSubmit(event);
      return;
    }
    if (role === 'profile-edit-form') {
      handleProfileEditSubmit(event);
    }
  });

  document.addEventListener('input', (event) => {
    if (event.target.dataset.role === 'board-search') {
      handleBoardSearch(event);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && state.modal) {
      state.modal = null;
      render();
    }
  });
}

window.addEventListener('hashchange', () => {
  const hash = window.location.hash;
  if (hash.startsWith('#post-')) {
    const postId = hash.replace('#post-', '');
    if (postId) {
      state.selectedPostId = postId;
      state.tab = 'board';
      render();
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  ensureSeedData();
  bindEvents();
  render();
});
