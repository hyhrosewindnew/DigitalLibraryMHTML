/* ========== 左侧抽屉式导航（仅首页使用） ========== */
/* 左侧固定栏：默认展开（✕ 关闭 / 校名+English / 文字菜单），收起为图标栏 */
/* 悬停栏目滑出子菜单面板；部分功能需登录后进入 */
(function () {
  const header = document.querySelector('.site-header');
  const nav = header && header.querySelector('.sh-nav');
  if (!header || !nav) return;

  /* 仅首页启用左侧导航栏，其他页面不注入 */
  const page = decodeURIComponent(location.pathname.split('/').pop() || '首页.html');
  if (page !== '首页.html') return;
  document.body.classList.add('has-left-rail');

  /* ---- 抽屉内容配置（按新导航结构：首页 / 借阅 / 资源 / 空间 / 其他服务 / 概况） ---- */
  const DRAWERS = {
    '借阅': [
      { title: '借阅服务', links: [
        ['借阅规则', '规则与违规说明', '借阅规则.html'],
        ['图书预约', '到馆通知', '图书预约说明.html'],
        ['图书续借 / 催还', '在线办理', '图书续借催还.html'],
        ['阅读推荐', '新书 · 热门', '阅读推荐.html'],
      ]},
    ],
    '资源': [
      { title: '馆藏与数字资源', links: [
        ['馆藏目录', '图书 · 期刊 · OPAC', '馆藏目录.html'],
        ['数据库导航', '中外文 · 试用库', '数据库导航.html'],
        ['特色馆藏', '古籍 · 航空 · 地方', '特色馆藏.html'],
        ['资源动态', '数据库试用与更新', '资源动态.html?from=nav'],
      ]},
    ],
    '空间': [
      { title: '空间服务', links: [
        ['座位预约', '实时选座', '座位预约说明.html'],
        ['研修室预约', '研讨 · 小组', '研修室预约说明.html'],
        ['自助服务', '借书机 · 打印', '自助服务.html'],
      ]},
    ],
    '其他服务': [
      { title: '荐购 · 捐赠 · VPN', links: [
        ['资源荐购', '推荐采购', '资源荐购.html'],
        ['图书捐赠', '接收 · 致谢', '图书捐赠.html'],
        ['校外访问', 'VPN · 校外使用', '校外访问.html'],
      ]},
      { title: '研究与服务', links: [
        ['论文提交', '机构库 · 硕博', '论文提交.html'],
        ['信息素养', '课程 · 培训', '信息素养.html'],
        ['科技查新', '立项 · 成果', '科技查新.html'],
        ['知识产权', '专利 · 版权', '知识产权.html'],
      ]},
    ],
    '概况': [
      { title: '本馆概况', links: [
        ['本馆简介', '办馆历史 · 现状', '本馆简介.html'],
        ['馆藏分布', '楼层 · 分区', '馆藏分布.html'],
        ['入馆须知', '刷卡 · 秩序', '入馆须知.html'],
        ['开放时间', '08:00 - 22:00', '开放时间.html'],
        ['馆舍风貌', '建筑 · 文化', '馆舍风貌.html'],
        ['组织机构', '部门 · 人员', '组织机构.html'],
        ['规章制度', '制度 · 规范', '规章制度.html'],
        ['联系我们', '电话 · 邮箱', '联系我们.html'],
      ]},
    ],
  };

  /* ---- 收起态图标栏用的小图标 ---- */
  const I = (inner) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
  const ICONS = {
    '首页': I('<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/>'),
    '借阅': I('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V6.5A2.5 2.5 0 0 0 17.5 4H6.5A2.5 2.5 0 0 0 4 6.5z"/><path d="M8 2v2M16 2v2"/>'),
    '资源': I('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>'),
    '空间': I('<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18"/><path d="M8 2v4"/><path d="M16 2v4"/>'),
    '其他服务': I('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    '概况': I('<circle cx="12" cy="12" r="9"/><path d="M12 7h.01"/><path d="M11 11h1v5h1"/>'),
    '我的图书馆': I('<path d="M4 19V6a2 2 0 0 1 2-2h13v13H6a2 2 0 0 0-2 2Z"/><path d="M4 19a2 2 0 0 0 2 2h13"/>'),
    '搜索': I('<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>'),
  };
  const ORDER = ['首页', '借阅', '资源', '空间', '其他服务', '概况'];

  /* ---- 需登录后进入的页面 ---- */
  const AUTH_PAGES = ['个人中心.html', '我的借阅.html', '续借.html', '我的收藏.html',
    '预约记录.html', '消息通知.html', '账户设置.html', '荐购记录查询.html', '违章查询.html'];
  const isLoggedIn = () => !!sessionStorage.getItem('libUser');

  /* ---- 移除旧的小下拉 ---- */
  nav.querySelectorAll('.sh-dropdown-menu').forEach(m => m.remove());

  /* ---- 左侧固定栏（进入首页自动展开，可收起） ---- */
  if (page === '首页.html') {
    sessionStorage.setItem('navCollapsed', '0');
  }
  if (sessionStorage.getItem('navCollapsed') === '1') {
    document.body.classList.add('nav-collapsed');
  }
  const rail = document.createElement('div');
  rail.className = 'side-rail';
  rail.innerHTML =
    `<button class="sr-close" title="收起导航" aria-label="收起导航">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
    </button>
    <div class="sr-items">` +
    ORDER.map(k => {
      /* 用户要求导航默认不高亮，不再根据当前页加 active 类 */
      if (k === '首页') {
        return `<a class="sr-item no-sub" href="/user/首页.html" data-key="首页">${ICONS[k]}<span>首页</span></a>`;
      }
      return `<div class="sr-item" data-key="${k}">${ICONS[k]}<span>${k}</span></div>`;
    }).join('') +
    `</div>
    <button class="sr-expand" title="展开导航" aria-label="展开导航">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></svg>
      <span>已收起</span>
    </button>`;
  document.body.appendChild(rail);

  /* ---- 首页最最顶部细条：校名 | English ---- */
  if (page === '首页.html') {
    const superBar = document.createElement('div');
    superBar.className = 'tb-super';
    superBar.innerHTML = '<span class="tb-welcome">欢迎来到 信阳航空职业学院 · 数字图书馆</span><span class="tb-super-links"><a href="javascript:void(0)">学校首页</a><span>|</span><a href="javascript:void(0)">读者协会</a><span>|</span><a href="javascript:void(0)">志愿服务</a><span>|</span><a href="javascript:void(0)">English</a></span>';
    document.body.prepend(superBar);
  }

  /* ---- 顶部信息栏：首页隐藏蓝色信息栏，数据并入白色拇指片 ---- */
  const topbar = document.querySelector('.site-topbar');
  const statsHTML = `<div class="tb-stats">
      <span class="tb-stat">开放时间 <b>08:00 - 22:00</b></span>
      <span class="tb-stat">可预约座位 <b>342</b></span>
      <span class="tb-stat">可预约研修室 <b>5<small>/27间</small></b></span>
      <span class="tb-stat">当前在馆人数 <b>1,286</b></span>
    </div>`;
  const actionsHTML = `<div class="tb-actions">
      <a class="tb-btn" href="统一身份认证.html?redirect=${encodeURIComponent('/user/首页.html')}">我的图书馆</a>
      <a class="tb-btn tb-btn-gold tb-search-ico" href="/user/馆藏目录.html" title="馆藏检索" aria-label="馆藏检索"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg></a>
    </div>`;
  const isHomePage = page === '首页.html';
  const tools = document.querySelector('.site-header .sh-tools, .site-header .sh-user');
  const brand = document.querySelector('.site-header .sh-brand, .site-header .sh-logo');
  if (isHomePage && brand) {
    brand.insertAdjacentHTML('afterend', `<div class="hd-stats">${statsHTML}</div>`);
  }
  if (tools) {
    tools.insertAdjacentHTML('beforebegin', `<div class="hd-mid">${actionsHTML}</div>`);
  }
  if (isHomePage && topbar) topbar.style.display = 'none';

  /* ---- 首屏透明，滚动离开首屏后变实色；首页首屏自动展开、离开首屏自动收起 ---- */
  const isHome = page === '首页.html';
  function updateRailBg() {
    const pastFirstScreen = window.scrollY > window.innerHeight - 80;
    /* 除首页外一律实色；首页首屏半透明，离开首屏后转实色 */
    rail.classList.toggle('solid', !isHome || pastFirstScreen);
    if (isHome) {
      document.body.classList.toggle('nav-collapsed', pastFirstScreen);
      if (pastFirstScreen) fly && fly.classList.remove('open');
    }
  }
  window.addEventListener('scroll', updateRailBg, { passive: true });

  /* ---- 滑出浮动面板（右侧，对齐悬停项） ---- */
  const fly = document.createElement('div');
  fly.className = 'side-flyout';
  fly.innerHTML = '<div class="sfo-title"></div><div class="sfo-body"></div>';
  document.body.appendChild(fly);
  const foTitle = fly.querySelector('.sfo-title');
  const foBody = fly.querySelector('.sfo-body');

  /* ---- 展开 / 收起 ---- */
  function collapse() {
    document.body.classList.add('nav-collapsed');
    sessionStorage.setItem('navCollapsed', '1');
    fly.classList.remove('open');
  }
  function expand() {
    document.body.classList.remove('nav-collapsed');
    sessionStorage.setItem('navCollapsed', '0');
  }
  rail.querySelector('.sr-close').addEventListener('click', collapse);
  rail.querySelector('.sr-expand').addEventListener('click', expand);

  /* ---- 浮动面板渲染与悬停 ---- */
  let hideTimer = null;

  function openPanel(el, key) {
    clearTimeout(hideTimer);
    const groups = DRAWERS[key];
    if (!groups) return;
    foTitle.textContent = key;
    foBody.innerHTML = groups.map(g => `
      <div class="nd-col">
        <div class="nd-col-title">${g.title}</div>
        ${g.links.map(l => `
          <a class="nd-link${(l[2] === page && page !== '首页.html') ? ' current' : ''}" href="${l[2]}">
            <span class="nd-name">${l[0]}</span>
            <span class="nd-desc">${l[1]}</span>
          </a>`).join('')}
      </div>`).join('');
    fly.classList.add('open');
    /* 对齐到悬停项，避免超出底部 */
    const r = el.getBoundingClientRect();
    const top = Math.min(Math.max(r.top - 8, 12), window.innerHeight - fly.offsetHeight - 12);
    fly.style.top = top + 'px';
    rail.querySelectorAll('.sr-item').forEach(o =>
      o.classList.toggle('hover', o.dataset.key === key));
  }
  function scheduleClose() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      fly.classList.remove('open');
      rail.querySelectorAll('.sr-item').forEach(o => o.classList.remove('hover'));
    }, 160);
  }

  rail.querySelectorAll('.sr-item[data-key]').forEach(el => {
    const key = el.dataset.key;
    if (!DRAWERS[key]) return;
    el.addEventListener('mouseenter', () => openPanel(el, key));
  });
  rail.addEventListener('mouseleave', scheduleClose);
  fly.addEventListener('mouseenter', () => clearTimeout(hideTimer));
  fly.addEventListener('mouseleave', scheduleClose);
  document.addEventListener('click', e => {
    if (!rail.contains(e.target) && !fly.contains(e.target)) {
      fly.classList.remove('open');
    }
  });

  /* 面板创建完成后执行首次状态判断 */
  updateRailBg();

  /* ---- 登录拦截：受保护页面未登录时弹出登录框 ---- */
  const mask = document.createElement('div');
  mask.className = 'auth-mask';
  mask.innerHTML = `
    <div class="auth-modal">
      <button class="am-close" aria-label="关闭">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
      </button>
      <div class="am-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
      </div>
      <div class="am-title">读者登录</div>
      <div class="am-tip">该功能需登录后使用</div>
      <input class="am-input" id="am-id" placeholder="学号 / 工号" autocomplete="off">
      <input class="am-input" id="am-pwd" type="password" placeholder="密码">
      <button class="am-btn">登 录</button>
    </div>`;
  document.body.appendChild(mask);
  let pendingHref = null;

  /* 消息/收藏/用户图标：登录后才显示（默认 CSS 隐藏，登录后加 logged-in） */
  function syncTools() { document.body.classList.toggle('logged-in', isLoggedIn()); }
  syncTools();

  /* ---- 头像下拉：个人中心 / 账户设置 / 退出登录 ---- */
  const avatarWrap = document.querySelector('.sh-user .sh-avatar-wrap');
  if (avatarWrap) {
    const userMenu = document.createElement('div');
    userMenu.className = 'sh-user-menu';
    userMenu.innerHTML = '<a href="/user/个人中心.html">个人中心</a><a href="/user/账户设置.html">账户设置</a><button type="button" class="sh-logout">退出登录</button>';
    avatarWrap.parentElement.appendChild(userMenu);
    avatarWrap.addEventListener('click', e => {
      if (!isLoggedIn()) return;              // 未登录时交给全站拦截逻辑弹登录框
      e.preventDefault();
      userMenu.classList.toggle('show');
    });
    userMenu.querySelector('.sh-logout').addEventListener('click', () => {
      sessionStorage.removeItem('libUser');
      syncTools();
      userMenu.classList.remove('show');
      location.reload();
    });
    document.addEventListener('click', e => {
      if (!avatarWrap.contains(e.target) && !userMenu.contains(e.target)) userMenu.classList.remove('show');
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') userMenu.classList.remove('show');
    });
  }

  function openAuth(href) {
    pendingHref = href;
    mask.classList.add('show');
    setTimeout(() => mask.querySelector('#am-id').focus(), 60);
  }
  function closeAuth() { mask.classList.remove('show'); pendingHref = null; }
  mask.querySelector('.am-close').addEventListener('click', closeAuth);
  mask.addEventListener('click', e => { if (e.target === mask) closeAuth(); });
  mask.querySelector('.am-btn').addEventListener('click', () => {
    const id = mask.querySelector('#am-id').value.trim();
    if (!id) { mask.querySelector('#am-id').focus(); return; }
    sessionStorage.setItem('libUser', id);
    syncTools();
    const href = pendingHref;
    closeAuth();
    if (href) location.href = href;
  });

  /* 拦截侧栏「我的图书馆」及全站受保护链接 */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    const needAuth = a.dataset.auth === '1' || AUTH_PAGES.some(p => href === p || href.endsWith('/' + p));
    if (needAuth && !isLoggedIn()) {
      e.preventDefault();
      openAuth(href);
    }
  }, true);
})();

/* ========== 其他页面：登录态同步 + 头像菜单 ========== */
(function () {
  const page = decodeURIComponent(location.pathname.split('/').pop() || '首页.html');
  if (page === '首页.html') return;

  const isLoggedIn = () => !!sessionStorage.getItem('libUser');
  document.body.classList.toggle('logged-in', isLoggedIn());

  /* 已登录时「我的图书馆」直达个人中心；未登录时链接本身指向统一身份认证 */
  if (isLoggedIn()) {
    document.querySelectorAll('a[data-auth="1"]').forEach(a => { a.href = '个人中心.html'; });
  }

  const avatarWrap = document.querySelector('.site-header .sh-user .sh-avatar-wrap');
  if (!avatarWrap) return;

  const userMenu = document.createElement('div');
  userMenu.className = 'sh-user-menu';
  userMenu.innerHTML = '<a href="/user/个人中心.html">个人中心</a><a href="/user/账户设置.html">账户设置</a><button type="button" class="sh-logout">退出登录</button>';
  avatarWrap.parentElement.appendChild(userMenu);
  avatarWrap.addEventListener('click', e => {
    if (!isLoggedIn()) return;
    e.preventDefault();
    userMenu.classList.toggle('show');
  });
  userMenu.querySelector('.sh-logout').addEventListener('click', () => {
    sessionStorage.removeItem('libUser');
    document.body.classList.remove('logged-in');
    userMenu.classList.remove('show');
    location.reload();
  });
  document.addEventListener('click', e => {
    if (!avatarWrap.contains(e.target) && !userMenu.contains(e.target)) userMenu.classList.remove('show');
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') userMenu.classList.remove('show');
  });
})();
