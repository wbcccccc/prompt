# 组件与功能实现文档

## 一、基础组件实现

### 1. 输入类组件

#### 1.1 文本输入框 (Input)
- 字符限制：
  * 最大长度：支持设置最大输入字符数，超出限制自动截断
  ```javascript
  class Input {
    constructor(options = {}) {
      this.maxLength = options.maxLength;
      this.minLength = options.minLength;
      this.value = '';
      this.init();
    }

    init() {
      this.createInput();
      this.bindEvents();
    }

    createInput() {
      this.input = document.createElement('input');
      if (this.maxLength) {
        this.input.maxLength = this.maxLength;
      }
      if (this.minLength) {
        this.input.minLength = this.minLength;
      }
    }

    bindEvents() {
      this.input.addEventListener('input', this.handleInput.bind(this));
      this.input.addEventListener('blur', this.handleBlur.bind(this));
    }

    handleInput(event) {
      this.value = event.target.value;
      if (this.maxLength && this.value.length > this.maxLength) {
        this.value = this.value.slice(0, this.maxLength);
        this.input.value = this.value;
      }
      this.validate();
    }

    validate() {
      if (this.minLength && this.value.length < this.minLength) {
        this.showError(`最小长度为 ${this.minLength} 个字符`);
        return false;
      }
      this.hideError();
      return true;
    }

    showError(message) {
      if (!this.errorElement) {
        this.errorElement = document.createElement('div');
        this.errorElement.className = 'error-message';
        this.input.parentNode.appendChild(this.errorElement);
      }
      this.errorElement.textContent = message;
      this.input.classList.add('error');
    }

    hideError() {
      if (this.errorElement) {
        this.errorElement.textContent = '';
        this.input.classList.remove('error');
      }
    }
  }
  ```

  * 最小长度：支持设置最小输入字符数，未达到要求显示提示
  ```javascript
  // 使用示例
  const input = new Input({
    maxLength: 100,
    minLength: 5
  });
  ```

- 输入类型：
  * 文本：普通文本输入，支持中英文
  ```javascript
  class TextInput extends Input {
    constructor(options = {}) {
      super(options);
      this.type = 'text';
      this.init();
    }

    init() {
      super.init();
      this.input.type = this.type;
    }

    validate() {
      if (!super.validate()) return false;
      return true;
    }
  }
  ```

  * 数字：仅允许输入数字，支持小数点和负数
  ```javascript
  class NumberInput extends Input {
    constructor(options = {}) {
      super(options);
      this.type = 'number';
      this.min = options.min;
      this.max = options.max;
      this.step = options.step || 1;
      this.init();
    }

    init() {
      super.init();
      this.input.type = this.type;
      if (this.min !== undefined) this.input.min = this.min;
      if (this.max !== undefined) this.input.max = this.max;
      this.input.step = this.step;
    }

    validate() {
      if (!super.validate()) return false;
      
      const value = parseFloat(this.value);
      if (isNaN(value)) {
        this.showError('请输入有效的数字');
        return false;
      }
      
      if (this.min !== undefined && value < this.min) {
        this.showError(`最小值为 ${this.min}`);
        return false;
      }
      
      if (this.max !== undefined && value > this.max) {
        this.showError(`最大值为 ${this.max}`);
        return false;
      }
      
      return true;
    }
  }
  ```

  * 密码：输入内容显示为掩码，支持显示/隐藏切换
  ```javascript
  class PasswordInput extends Input {
    constructor(options = {}) {
      super(options);
      this.type = 'password';
      this.showPassword = false;
      this.init();
    }

    init() {
      super.init();
      this.input.type = this.type;
      this.createToggleButton();
    }

    createToggleButton() {
      this.toggleButton = document.createElement('button');
      this.toggleButton.type = 'button';
      this.toggleButton.className = 'password-toggle';
      this.toggleButton.innerHTML = '👁';
      this.toggleButton.addEventListener('click', this.togglePasswordVisibility.bind(this));
      this.input.parentNode.appendChild(this.toggleButton);
    }

    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
      this.input.type = this.showPassword ? 'text' : 'password';
      this.toggleButton.innerHTML = this.showPassword ? '👁‍🗨' : '👁';
    }
  }
  ```

#### 1.2 文本域 (Textarea)
```javascript
class Textarea {
  constructor(options = {}) {
    this.maxLength = options.maxLength;
    this.minLength = options.minLength;
    this.autoHeight = options.autoHeight || false;
    this.value = '';
    this.init();
  }

  init() {
    this.createTextarea();
    this.bindEvents();
    if (this.autoHeight) {
      this.setupAutoHeight();
    }
  }

  createTextarea() {
    this.textarea = document.createElement('textarea');
    if (this.maxLength) {
      this.textarea.maxLength = this.maxLength;
    }
    if (this.minLength) {
      this.textarea.minLength = this.minLength;
    }
    this.createCounter();
  }

  createCounter() {
    this.counter = document.createElement('div');
    this.counter.className = 'textarea-counter';
    this.updateCounter();
    this.textarea.parentNode.appendChild(this.counter);
  }

  updateCounter() {
    const length = this.value.length;
    if (this.maxLength) {
      this.counter.textContent = `${length}/${this.maxLength}`;
    } else {
      this.counter.textContent = length;
    }
  }

  setupAutoHeight() {
    this.textarea.style.overflowY = 'hidden';
    this.textarea.style.resize = 'none';
    this.adjustHeight();
  }

  adjustHeight() {
    this.textarea.style.height = 'auto';
    this.textarea.style.height = `${this.textarea.scrollHeight}px`;
  }

  bindEvents() {
    this.textarea.addEventListener('input', this.handleInput.bind(this));
    if (this.autoHeight) {
      this.textarea.addEventListener('input', this.adjustHeight.bind(this));
    }
  }

  handleInput(event) {
    this.value = event.target.value;
    this.updateCounter();
    this.validate();
  }

  validate() {
    if (this.minLength && this.value.length < this.minLength) {
      this.showError(`最小长度为 ${this.minLength} 个字符`);
      return false;
    }
    this.hideError();
    return true;
  }
}
```

#### 1.3 选择器 (Select)
```javascript
class Select {
  constructor(options = {}) {
    this.multiple = options.multiple || false;
    this.searchable = options.searchable || false;
    this.options = options.options || [];
    this.value = this.multiple ? [] : '';
    this.init();
  }

  init() {
    this.createSelect();
    this.bindEvents();
    if (this.searchable) {
      this.setupSearch();
    }
  }

  createSelect() {
    this.container = document.createElement('div');
    this.container.className = 'select-container';

    this.select = document.createElement('div');
    this.select.className = 'select';

    this.dropdown = document.createElement('div');
    this.dropdown.className = 'select-dropdown';

    this.renderOptions();
    
    this.container.appendChild(this.select);
    this.container.appendChild(this.dropdown);
  }

  renderOptions() {
    this.dropdown.innerHTML = this.options
      .map(option => `
        <div class="select-option" data-value="${option.value}">
          ${option.label}
        </div>
      `)
      .join('');
  }

  setupSearch() {
    this.searchInput = document.createElement('input');
    this.searchInput.className = 'select-search';
    this.searchInput.placeholder = '搜索...';
    this.searchInput.addEventListener('input', this.handleSearch.bind(this));
    this.dropdown.insertBefore(this.searchInput, this.dropdown.firstChild);
  }

  handleSearch(event) {
    const keyword = event.target.value.toLowerCase();
    const options = this.dropdown.querySelectorAll('.select-option');
    
    options.forEach(option => {
      const text = option.textContent.toLowerCase();
      option.style.display = text.includes(keyword) ? '' : 'none';
    });
  }

  bindEvents() {
    this.select.addEventListener('click', () => {
      this.dropdown.classList.toggle('active');
    });

    this.dropdown.addEventListener('click', event => {
      if (event.target.classList.contains('select-option')) {
        this.handleOptionSelect(event.target);
      }
    });

    document.addEventListener('click', event => {
      if (!this.container.contains(event.target)) {
        this.dropdown.classList.remove('active');
      }
    });
  }

  handleOptionSelect(option) {
    const value = option.dataset.value;
    
    if (this.multiple) {
      const index = this.value.indexOf(value);
      if (index === -1) {
        this.value.push(value);
        option.classList.add('selected');
      } else {
        this.value.splice(index, 1);
        option.classList.remove('selected');
      }
    } else {
      this.value = value;
      this.dropdown.querySelectorAll('.select-option').forEach(opt => {
        opt.classList.remove('selected');
      });
      option.classList.add('selected');
      this.dropdown.classList.remove('active');
    }
    
    this.updateSelection();
  }

  updateSelection() {
    if (this.multiple) {
      const labels = this.value
        .map(value => {
          const option = this.options.find(opt => opt.value === value);
          return option ? option.label : '';
        })
        .filter(Boolean);
      
      this.select.textContent = labels.length ? labels.join(', ') : '请选择';
    } else {
      const option = this.options.find(opt => opt.value === this.value);
      this.select.textContent = option ? option.label : '请选择';
    }
  }
}
```

### 2. 按钮类组件

#### 2.1 基础按钮 (Button)
```javascript
class Button {
  constructor(options = {}) {
    this.text = options.text || '';
    this.type = options.type || 'default';
    this.size = options.size || 'medium';
    this.icon = options.icon;
    this.loading = false;
    this.disabled = options.disabled || false;
    this.init();
  }

  init() {
    this.createButton();
    this.bindEvents();
  }

  createButton() {
    this.button = document.createElement('button');
    this.button.className = `btn btn-${this.type} btn-${this.size}`;
    this.button.disabled = this.disabled;
    this.updateContent();
  }

  updateContent() {
    let content = '';
    
    if (this.loading) {
      content += '<span class="btn-loading"></span>';
    }
    
    if (this.icon && !this.loading) {
      content += `<span class="btn-icon">${this.icon}</span>`;
    }
    
    content += `<span class="btn-text">${this.text}</span>`;
    
    this.button.innerHTML = content;
  }

  bindEvents() {
    this.button.addEventListener('click', this.handleClick.bind(this));
  }

  handleClick(event) {
    if (this.loading || this.disabled) {
      event.preventDefault();
      return;
    }
    // 处理点击事件
  }

  setLoading(loading) {
    this.loading = loading;
    this.button.disabled = loading;
    this.updateContent();
  }

  setDisabled(disabled) {
    this.disabled = disabled;
    this.button.disabled = disabled;
  }
}
```

#### 2.2 按钮组 (ButtonGroup)
```javascript
class ButtonGroup {
  constructor(options = {}) {
    this.buttons = options.buttons || [];
    this.direction = options.direction || 'horizontal';
    this.spacing = options.spacing || 8;
    this.init();
  }

  init() {
    this.createButtonGroup();
    this.renderButtons();
  }

  createButtonGroup() {
    this.container = document.createElement('div');
    this.container.className = `btn-group btn-group-${this.direction}`;
    this.container.style.gap = `${this.spacing}px`;
  }

  renderButtons() {
    this.buttons.forEach(buttonConfig => {
      const button = new Button(buttonConfig);
      this.container.appendChild(button.button);
    });
  }

  addButton(buttonConfig) {
    const button = new Button(buttonConfig);
    this.buttons.push(button);
    this.container.appendChild(button.button);
  }

  removeButton(index) {
    if (index >= 0 && index < this.buttons.length) {
      const button = this.buttons[index];
      button.button.remove();
      this.buttons.splice(index, 1);
    }
  }
}
```

### 3. 表单类组件

#### 3.1 表单容器 (Form)
```javascript
class Form {
  constructor(options = {}) {
    this.layout = options.layout || 'vertical';
    this.items = new Map();
    this.validators = new Map();
    this.init();
  }

  init() {
    this.createForm();
    this.bindEvents();
  }

  createForm() {
    this.form = document.createElement('form');
    this.form.className = `form form-${this.layout}`;
  }

  addItem(name, component, rules = []) {
    const formItem = new FormItem({
      name,
      component,
      rules
    });
    
    this.items.set(name, formItem);
    this.validators.set(name, rules);
    this.form.appendChild(formItem.container);
  }

  removeItem(name) {
    const item = this.items.get(name);
    if (item) {
      item.container.remove();
      this.items.delete(name);
      this.validators.delete(name);
    }
  }

  bindEvents() {
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
  }

  async handleSubmit(event) {
    event.preventDefault();
    
    if (await this.validate()) {
      const formData = this.getFormData();
      // 处理表单提交
      console.log('Form data:', formData);
    }
  }

  async validate() {
    const results = await Promise.all(
      Array.from(this.items.entries()).map(async ([name, item]) => {
        const rules = this.validators.get(name);
        return item.validate(rules);
      })
    );
    
    return results.every(result => result);
  }

  getFormData() {
    const formData = {};
    this.items.forEach((item, name) => {
      formData[name] = item.getValue();
    });
    return formData;
  }

  reset() {
    this.items.forEach(item => item.reset());
  }
}
```

#### 3.2 表单项 (FormItem)
```javascript
class FormItem {
  constructor(options = {}) {
    this.name = options.name;
    this.component = options.component;
    this.rules = options.rules || [];
    this.init();
  }

  init() {
    this.createFormItem();
  }

  createFormItem() {
    this.container = document.createElement('div');
    this.container.className = 'form-item';
    
    if (this.label) {
      this.labelElement = document.createElement('label');
      this.labelElement.className = 'form-item-label';
      this.labelElement.textContent = this.label;
      this.container.appendChild(this.labelElement);
    }
    
    this.contentElement = document.createElement('div');
    this.contentElement.className = 'form-item-content';
    this.contentElement.appendChild(this.component.element);
    
    this.errorElement = document.createElement('div');
    this.errorElement.className = 'form-item-error';
    
    this.container.appendChild(this.contentElement);
    this.container.appendChild(this.errorElement);
  }

  async validate(rules = this.rules) {
    let valid = true;
    let errorMessage = '';
    
    for (const rule of rules) {
      try {
        await rule.validator(this.getValue());
      } catch (error) {
        valid = false;
        errorMessage = error.message;
        break;
      }
    }
    
    this.setError(valid ? '' : errorMessage);
    return valid;
  }

  getValue() {
    return this.component.getValue();
  }

  setValue(value) {
    this.component.setValue(value);
  }

  reset() {
    this.setValue('');
    this.setError('');
  }

  setError(message) {
    this.errorElement.textContent = message;
    this.container.classList.toggle('has-error', !!message);
  }
}
```

## 二、业务组件实现

### 1. 用户相关组件

#### 1.1 用户信息卡片
```javascript
class UserCard {
  constructor(options = {}) {
    this.user = options.user || {};
    this.init();
  }

  init() {
    this.createCard();
    this.bindEvents();
  }

  createCard() {
    this.card = document.createElement('div');
    this.card.className = 'user-card';
    
    this.card.innerHTML = `
      <div class="user-card-avatar">
        <img src="${this.user.avatar}" alt="${this.user.name}">
      </div>
      <div class="user-card-info">
        <div class="user-card-name">${this.user.name}</div>
        <div class="user-card-title">${this.user.title}</div>
      </div>
      <div class="user-card-actions">
        <button class="btn btn-follow">关注</button>
        <button class="btn btn-message">私信</button>
      </div>
    `;
  }

  bindEvents() {
    const followBtn = this.card.querySelector('.btn-follow');
    const messageBtn = this.card.querySelector('.btn-message');
    
    followBtn.addEventListener('click', () => this.handleFollow());
    messageBtn.addEventListener('click', () => this.handleMessage());
  }

  handleFollow() {
    // 处理关注事件
  }

  handleMessage() {
    // 处理私信事件
  }
}
```

#### 1.2 用户列表
```javascript
class UserList {
  constructor(options = {}) {
    this.users = options.users || [];
    this.pageSize = options.pageSize || 10;
    this.currentPage = 1;
    this.init();
  }

  init() {
    this.createList();
    this.loadUsers();
    this.bindEvents();
  }

  createList() {
    this.container = document.createElement('div');
    this.container.className = 'user-list';
    
    this.listElement = document.createElement('div');
    this.listElement.className = 'user-list-content';
    
    this.paginationElement = document.createElement('div');
    this.paginationElement.className = 'user-list-pagination';
    
    this.container.appendChild(this.listElement);
    this.container.appendChild(this.paginationElement);
  }

  async loadUsers() {
    try {
      const response = await fetch(`/api/users?page=${this.currentPage}&size=${this.pageSize}`);
      const data = await response.json();
      this.users = data.users;
      this.totalPages = Math.ceil(data.total / this.pageSize);
      this.renderList();
      this.renderPagination();
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  }

  renderList() {
    this.listElement.innerHTML = this.users.map(user => `
      <div class="user-list-item">
        <div class="user-list-avatar">
          <img src="${user.avatar}" alt="${user.name}">
        </div>
        <div class="user-list-info">
          <div class="user-list-name">${user.name}</div>
          <div class="user-list-title">${user.title}</div>
        </div>
        <div class="user-list-actions">
          <button class="btn btn-follow" data-user-id="${user.id}">
            ${user.isFollowing ? '已关注' : '关注'}
          </button>
        </div>
      </div>
    `).join('');
  }

  renderPagination() {
    this.paginationElement.innerHTML = `
      <button class="btn-prev" ${this.currentPage === 1 ? 'disabled' : ''}>
        上一页
      </button>
      <span class="page-info">${this.currentPage} / ${this.totalPages}</span>
      <button class="btn-next" ${this.currentPage === this.totalPages ? 'disabled' : ''}>
        下一页
      </button>
    `;
  }

  bindEvents() {
    this.listElement.addEventListener('click', event => {
      const followBtn = event.target.closest('.btn-follow');
      if (followBtn) {
        const userId = followBtn.dataset.userId;
        this.handleFollow(userId);
      }
    });

    this.paginationElement.addEventListener('click', event => {
      if (event.target.classList.contains('btn-prev') && this.currentPage > 1) {
        this.currentPage--;
        this.loadUsers();
      } else if (event.target.classList.contains('btn-next') && this.currentPage < this.totalPages) {
        this.currentPage++;
        this.loadUsers();
      }
    });
  }

  async handleFollow(userId) {
    try {
      const user = this.users.find(u => u.id === userId);
      if (!user) return;

      const response = await fetch(`/api/users/${userId}/follow`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        user.isFollowing = !user.isFollowing;
        this.renderList();
      }
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  }
}
```

### 2. 内容展示组件

#### 2.1 内容卡片
```javascript
class ContentCard {
  constructor(options = {}) {
    this.content = options.content || {};
    this.init();
  }

  init() {
    this.createCard();
    this.bindEvents();
  }

  createCard() {
    this.card = document.createElement('div');
    this.card.className = 'content-card';
    
    this.card.innerHTML = `
      <div class="content-card-header">
        <div class="content-card-title">
          <h3>${this.content.title}</h3>
          ${this.renderTags()}
        </div>
        <div class="content-card-meta">
          <span class="author">${this.content.author}</span>
          <span class="time">${this.formatTime(this.content.time)}</span>
        </div>
      </div>
      <div class="content-card-body">
        ${this.renderContent()}
      </div>
      <div class="content-card-footer">
        <div class="content-card-stats">
          <span class="views">${this.content.views} 浏览</span>
          <span class="likes">${this.content.likes} 点赞</span>
          <span class="comments">${this.content.comments} 评论</span>
        </div>
        <div class="content-card-actions">
          <button class="btn-like ${this.content.isLiked ? 'active' : ''}">
            <i class="icon-like"></i> 点赞
          </button>
          <button class="btn-comment">
            <i class="icon-comment"></i> 评论
          </button>
          <button class="btn-share">
            <i class="icon-share"></i> 分享
          </button>
        </div>
      </div>
    `;
  }

  renderTags() {
    return this.content.tags
      ? `<div class="content-card-tags">
          ${this.content.tags.map(tag => `
            <span class="tag">${tag}</span>
          `).join('')}
        </div>`
      : '';
  }

  renderContent() {
    let html = '';
    
    if (this.content.type === 'text') {
      html = `<div class="text-content">${this.content.body}</div>`;
    } else if (this.content.type === 'image') {
      html = `
        <div class="image-content">
          <img src="${this.content.url}" alt="${this.content.title}">
        </div>
      `;
    } else if (this.content.type === 'video') {
      html = `
        <div class="video-content">
          <video src="${this.content.url}" controls></video>
        </div>
      `;
    }
    
    return html;
  }

  formatTime(time) {
    // 实现时间格式化逻辑
    return new Date(time).toLocaleString();
  }

  bindEvents() {
    const likeBtn = this.card.querySelector('.btn-like');
    const commentBtn = this.card.querySelector('.btn-comment');
    const shareBtn = this.card.querySelector('.btn-share');
    
    likeBtn.addEventListener('click', () => this.handleLike());
    commentBtn.addEventListener('click', () => this.handleComment());
    shareBtn.addEventListener('click', () => this.handleShare());
  }

  async handleLike() {
    try {
      const response = await fetch(`/api/content/${this.content.id}/like`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        this.content.isLiked = !this.content.isLiked;
        this.content.likes += this.content.isLiked ? 1 : -1;
        this.updateLikeButton();
      }
    } catch (error) {
      console.error('Failed to like content:', error);
    }
  }

  updateLikeButton() {
    const likeBtn = this.card.querySelector('.btn-like');
    const likesCount = this.card.querySelector('.likes');
    
    likeBtn.classList.toggle('active', this.content.isLiked);
    likesCount.textContent = `${this.content.likes} 点赞`;
  }

  handleComment() {
    // 实现评论功能
  }

  handleShare() {
    // 实现分享功能
  }
}
```

#### 2.2 图片展示
```javascript
class ImageViewer {
  constructor(options = {}) {
    this.images = options.images || [];
    this.currentIndex = 0;
    this.init();
  }

  init() {
    this.createViewer();
    this.bindEvents();
    this.loadImages();
  }

  createViewer() {
    this.container = document.createElement('div');
    this.container.className = 'image-viewer';
    
    this.container.innerHTML = `
      <div class="image-viewer-main">
        <div class="image-viewer-container"></div>
        <button class="btn-prev">
          <i class="icon-prev"></i>
        </button>
        <button class="btn-next">
          <i class="icon-next"></i>
        </button>
      </div>
      <div class="image-viewer-thumbnails"></div>
    `;
    
    this.mainContainer = this.container.querySelector('.image-viewer-container');
    this.thumbnailsContainer = this.container.querySelector('.image-viewer-thumbnails');
  }

  loadImages() {
    // 主图片
    this.mainContainer.innerHTML = `
      <img src="${this.images[this.currentIndex].url}" 
           alt="${this.images[this.currentIndex].title}"
           class="main-image">
    `;
    
    // 缩略图
    this.thumbnailsContainer.innerHTML = this.images.map((image, index) => `
      <div class="thumbnail ${index === this.currentIndex ? 'active' : ''}"
           data-index="${index}">
        <img src="${image.thumbnail || image.url}" 
             alt="${image.title}">
      </div>
    `).join('');
  }

  bindEvents() {
    const prevBtn = this.container.querySelector('.btn-prev');
    const nextBtn = this.container.querySelector('.btn-next');
    
    prevBtn.addEventListener('click', () => this.showPrevious());
    nextBtn.addEventListener('click', () => this.showNext());
    
    this.thumbnailsContainer.addEventListener('click', event => {
      const thumbnail = event.target.closest('.thumbnail');
      if (thumbnail) {
        const index = parseInt(thumbnail.dataset.index);
        this.showImage(index);
      }
    });
    
    // 支持键盘导航
    document.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') {
        this.showPrevious();
      } else if (event.key === 'ArrowRight') {
        this.showNext();
      }
    });
    
    // 支持手势滑动
    let touchStartX = 0;
    this.container.addEventListener('touchstart', event => {
      touchStartX = event.touches[0].clientX;
    });
    
    this.container.addEventListener('touchend', event => {
      const touchEndX = event.changedTouches[0].clientX;
      const diff = touchEndX - touchStartX;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.showPrevious();
        } else {
          this.showNext();
        }
      }
    });
  }

  showImage(index) {
    if (index < 0 || index >= this.images.length) return;
    
    this.currentIndex = index;
    
    // 更新主图
    const mainImage = this.mainContainer.querySelector('.main-image');
    mainImage.src = this.images[index].url;
    mainImage.alt = this.images[index].title;
    
    // 更新缩略图状态
    const thumbnails = this.thumbnailsContainer.querySelectorAll('.thumbnail');
    thumbnails.forEach((thumbnail, i) => {
      thumbnail.classList.toggle('active', i === index);
    });
  }

  showPrevious() {
    const index = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.showImage(index);
  }

  showNext() {
    const index = (this.currentIndex + 1) % this.images.length;
    this.showImage(index);
  }
}
```

### 3. 交互反馈组件

#### 3.1 消息提示
```javascript
class Message {
  static types = {
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error',
    INFO: 'info'
  };

  static defaultOptions = {
    duration: 3000,
    closable: true,
    position: 'top'
  };

  static container = null;

  static init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'message-container';
      document.body.appendChild(this.container);
    }
  }

  static show(content, type = this.types.INFO, options = {}) {
    this.init();
    
    const messageOptions = { ...this.defaultOptions, ...options };
    const messageElement = document.createElement('div');
    messageElement.className = `message message-${type}`;
    
    messageElement.innerHTML = `
      <div class="message-content">
        <i class="message-icon icon-${type}"></i>
        <span class="message-text">${content}</span>
      </div>
      ${messageOptions.closable ? '<button class="message-close">×</button>' : ''}
    `;
    
    this.container.appendChild(messageElement);
    
    // 动画效果
    requestAnimationFrame(() => {
      messageElement.classList.add('message-show');
    });
    
    // 自动关闭
    if (messageOptions.duration > 0) {
      setTimeout(() => {
        this.close(messageElement);
      }, messageOptions.duration);
    }
    
    // 手动关闭
    if (messageOptions.closable) {
      const closeBtn = messageElement.querySelector('.message-close');
      closeBtn.addEventListener('click', () => {
        this.close(messageElement);
      });
    }
    
    return messageElement;
  }

  static success(content, options) {
    return this.show(content, this.types.SUCCESS, options);
  }

  static warning(content, options) {
    return this.show(content, this.types.WARNING, options);
  }

  static error(content, options) {
    return this.show(content, this.types.ERROR, options);
  }

  static info(content, options) {
    return this.show(content, this.types.INFO, options);
  }

  static close(messageElement) {
    messageElement.classList.add('message-hide');
    
    messageElement.addEventListener('transitionend', () => {
      messageElement.remove();
      
      // 如果没有消息了，移除容器
      if (this.container && !this.container.children.length) {
        this.container.remove();
        this.container = null;
      }
    });
  }
}
```

#### 3.2 加载状态
```javascript
class Loading {
  static defaultOptions = {
    text: '加载中...',
    background: 'rgba(0, 0, 0, 0.7)',
    spinner: true
  };

  constructor(options = {}) {
    this.options = { ...Loading.defaultOptions, ...options };
    this.init();
  }

  init() {
    this.createLoading();
  }

  createLoading() {
    this.element = document.createElement('div');
    this.element.className = 'loading';
    this.element.style.background = this.options.background;
    
    this.element.innerHTML = `
      <div class="loading-content">
        ${this.options.spinner ? '<div class="loading-spinner"></div>' : ''}
        ${this.options.text ? `<div class="loading-text">${this.options.text}</div>` : ''}
      </div>
    `;
  }

  show(target = document.body) {
    if (target === document.body) {
      this.element.classList.add('loading-fullscreen');
    } else {
      target.classList.add('loading-relative');
    }
    
    target.appendChild(this.element);
    
    // 防止滚动穿透
    if (target === document.body) {
      document.body.style.overflow = 'hidden';
    }
  }

  hide() {
    const target = this.element.parentNode;
    
    this.element.remove();
    target.classList.remove('loading-relative');
    
    if (target === document.body) {
      document.body.style.overflow = '';
    }
  }

  setText(text) {
    const textElement = this.element.querySelector('.loading-text');
    if (textElement) {
      textElement.textContent = text;
    }
  }

  static service = {
    instance: null,
    
    show(options) {
      if (!this.instance) {
        this.instance = new Loading(options);
      }
      this.instance.show();
    },
    
    hide() {
      if (this.instance) {
        this.instance.hide();
        this.instance = null;
      }
    }
  };
}
```

### 4. 弹窗组件

#### 4.1 对话框 (Dialog)
```javascript
class Dialog {
  constructor(options = {}) {
    this.title = options.title || '提示';
    this.content = options.content || '';
    this.width = options.width || '500px';
    this.top = options.top || '15vh';
    this.showClose = options.showClose !== false;
    this.maskClosable = options.maskClosable !== false;
    this.beforeClose = options.beforeClose;
    this.afterClose = options.afterClose;
    this.init();
  }

  init() {
    this.createDialog();
    this.bindEvents();
  }

  createDialog() {
    this.container = document.createElement('div');
    this.container.className = 'dialog-container';
    
    this.dialog = document.createElement('div');
    this.dialog.className = 'dialog';
    this.dialog.style.width = this.width;
    this.dialog.style.marginTop = this.top;
    
    this.dialog.innerHTML = `
      <div class="dialog-header">
        <span class="dialog-title">${this.title}</span>
        ${this.showClose ? '<button class="dialog-close">×</button>' : ''}
      </div>
      <div class="dialog-body">${this.content}</div>
      <div class="dialog-footer">
        <slot name="footer">
          <button class="btn btn-cancel">取消</button>
          <button class="btn btn-primary">确定</button>
        </slot>
      </div>
    `;
    
    this.container.appendChild(this.dialog);
  }

  bindEvents() {
    if (this.showClose) {
      const closeBtn = this.dialog.querySelector('.dialog-close');
      closeBtn.addEventListener('click', () => this.close());
    }
    
    if (this.maskClosable) {
      this.container.addEventListener('click', event => {
        if (event.target === this.container) {
          this.close();
        }
      });
    }
    
    const cancelBtn = this.dialog.querySelector('.btn-cancel');
    const confirmBtn = this.dialog.querySelector('.btn-primary');
    
    cancelBtn.addEventListener('click', () => this.handleCancel());
    confirmBtn.addEventListener('click', () => this.handleConfirm());
  }

  async close() {
    if (this.beforeClose) {
      const canClose = await this.beforeClose();
      if (!canClose) return;
    }
    
    this.container.classList.add('dialog-fade-out');
    
    this.container.addEventListener('animationend', () => {
      this.container.remove();
      if (this.afterClose) {
        this.afterClose();
      }
    }, { once: true });
  }

  handleCancel() {
    this.close();
    if (this.onCancel) {
      this.onCancel();
    }
  }

  handleConfirm() {
    if (this.onConfirm) {
      this.onConfirm();
    }
  }

  show() {
    document.body.appendChild(this.container);
    requestAnimationFrame(() => {
      this.container.classList.add('dialog-fade-in');
    });
  }

  setTitle(title) {
    const titleElement = this.dialog.querySelector('.dialog-title');
    titleElement.textContent = title;
  }

  setContent(content) {
    const bodyElement = this.dialog.querySelector('.dialog-body');
    bodyElement.innerHTML = content;
  }

  static confirm(options) {
    const dialog = new Dialog({
      title: options.title || '确认',
      content: options.content,
      width: options.width,
      maskClosable: false
    });
    
    return new Promise((resolve, reject) => {
      dialog.onConfirm = () => {
        resolve(true);
        dialog.close();
      };
      
      dialog.onCancel = () => {
        resolve(false);
        dialog.close();
      };
      
      dialog.show();
    });
  }
}
```

#### 4.2 表格组件 (Table)
```javascript
class Table {
  constructor(options = {}) {
    this.data = options.data || [];
    this.columns = options.columns || [];
    this.selectable = options.selectable || false;
    this.sortable = options.sortable || false;
    this.pagination = options.pagination || false;
    this.pageSize = options.pageSize || 10;
    this.currentPage = 1;
    this.selectedRows = new Set();
    this.init();
  }

  init() {
    this.createTable();
    if (this.pagination) {
      this.createPagination();
    }
    this.bindEvents();
    this.render();
  }

  createTable() {
    this.container = document.createElement('div');
    this.container.className = 'table-container';
    
    this.table = document.createElement('table');
    this.table.className = 'table';
    
    this.thead = document.createElement('thead');
    this.tbody = document.createElement('tbody');
    
    this.table.appendChild(this.thead);
    this.table.appendChild(this.tbody);
    this.container.appendChild(this.table);
  }

  createPagination() {
    this.paginationElement = document.createElement('div');
    this.paginationElement.className = 'table-pagination';
    this.container.appendChild(this.paginationElement);
  }

  renderHeader() {
    const headerRow = document.createElement('tr');
    
    if (this.selectable) {
      headerRow.innerHTML = `
        <th class="table-selection">
          <input type="checkbox" class="table-checkbox-all">
        </th>
      `;
    }
    
    this.columns.forEach(column => {
      const th = document.createElement('th');
      th.className = 'table-column';
      if (column.width) {
        th.style.width = column.width;
      }
      
      let content = column.title;
      if (this.sortable && column.sortable !== false) {
        content += `
          <span class="table-sort-icons">
            <i class="sort-up"></i>
            <i class="sort-down"></i>
          </span>
        `;
      }
      
      th.innerHTML = content;
      headerRow.appendChild(th);
    });
    
    this.thead.innerHTML = '';
    this.thead.appendChild(headerRow);
  }

  renderBody() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const pageData = this.pagination 
      ? this.data.slice(startIndex, endIndex)
      : this.data;
    
    this.tbody.innerHTML = pageData.map(row => {
      let cells = '';
      
      if (this.selectable) {
        cells += `
          <td class="table-selection">
            <input type="checkbox" class="table-checkbox-row" 
                   ${this.selectedRows.has(row.id) ? 'checked' : ''}>
          </td>
        `;
      }
      
      this.columns.forEach(column => {
        const value = column.render 
          ? column.render(row[column.key], row)
          : row[column.key];
        
        cells += `<td class="table-cell">${value}</td>`;
      });
      
      return `<tr data-id="${row.id}">${cells}</tr>`;
    }).join('');
  }

  renderPagination() {
    if (!this.pagination) return;
    
    const totalPages = Math.ceil(this.data.length / this.pageSize);
    
    this.paginationElement.innerHTML = `
      <button class="btn-prev" ${this.currentPage === 1 ? 'disabled' : ''}>
        上一页
      </button>
      <span class="page-info">
        ${this.currentPage} / ${totalPages}
      </span>
      <button class="btn-next" 
              ${this.currentPage === totalPages ? 'disabled' : ''}>
        下一页
      </button>
    `;
  }

  render() {
    this.renderHeader();
    this.renderBody();
    if (this.pagination) {
      this.renderPagination();
    }
  }

  bindEvents() {
    if (this.selectable) {
      // 全选/取消全选
      this.thead.addEventListener('change', event => {
        if (event.target.classList.contains('table-checkbox-all')) {
          const checked = event.target.checked;
          this.tbody.querySelectorAll('.table-checkbox-row').forEach(checkbox => {
            checkbox.checked = checked;
            const row = checkbox.closest('tr');
            const rowId = row.dataset.id;
            if (checked) {
              this.selectedRows.add(rowId);
            } else {
              this.selectedRows.delete(rowId);
            }
          });
        }
      });
      
      // 单行选择
      this.tbody.addEventListener('change', event => {
        if (event.target.classList.contains('table-checkbox-row')) {
          const row = event.target.closest('tr');
          const rowId = row.dataset.id;
          if (event.target.checked) {
            this.selectedRows.add(rowId);
          } else {
            this.selectedRows.delete(rowId);
          }
        }
      });
    }
    
    if (this.sortable) {
      this.thead.addEventListener('click', event => {
        const sortIcon = event.target.closest('.sort-up, .sort-down');
        if (sortIcon) {
          const th = sortIcon.closest('th');
          const columnIndex = Array.from(th.parentNode.children).indexOf(th);
          const column = this.columns[columnIndex];
          
          if (column.sortable !== false) {
            const isAsc = sortIcon.classList.contains('sort-up');
            this.sort(column.key, isAsc);
          }
        }
      });
    }
    
    if (this.pagination) {
      this.paginationElement.addEventListener('click', event => {
        if (event.target.classList.contains('btn-prev') && this.currentPage > 1) {
          this.currentPage--;
          this.render();
        } else if (event.target.classList.contains('btn-next')) {
          const totalPages = Math.ceil(this.data.length / this.pageSize);
          if (this.currentPage < totalPages) {
            this.currentPage++;
            this.render();
          }
        }
      });
    }
  }

  sort(key, ascending) {
    this.data.sort((a, b) => {
      const valueA = a[key];
      const valueB = b[key];
      
      if (valueA < valueB) return ascending ? -1 : 1;
      if (valueA > valueB) return ascending ? 1 : -1;
      return 0;
    });
    
    this.render();
  }

  getSelectedRows() {
    return this.data.filter(row => this.selectedRows.has(row.id));
  }

  setData(data) {
    this.data = data;
    this.selectedRows.clear();
    this.currentPage = 1;
    this.render();
  }
}
```

#### 4.3 树形控件 (Tree)
```javascript
class Tree {
  constructor(options = {}) {
    this.data = options.data || [];
    this.checkable = options.checkable || false;
    this.expandAll = options.expandAll || false;
    this.checkedKeys = new Set(options.checkedKeys || []);
    this.expandedKeys = new Set(options.expandedKeys || []);
    this.init();
  }

  init() {
    this.createTree();
    this.bindEvents();
    this.render();
  }

  createTree() {
    this.container = document.createElement('div');
    this.container.className = 'tree';
  }

  renderNode(node, level = 0) {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = this.expandedKeys.has(node.key);
    const isChecked = this.checkable && this.checkedKeys.has(node.key);
    
    return `
      <div class="tree-node" data-key="${node.key}" style="padding-left: ${level * 24}px">
        ${hasChildren ? `
          <span class="tree-switcher ${isExpanded ? 'expanded' : ''}">
            <i class="icon-arrow"></i>
          </span>
        ` : `
          <span class="tree-switcher-placeholder"></span>
        `}
        
        ${this.checkable ? `
          <span class="tree-checkbox ${isChecked ? 'checked' : ''}">
            <span class="tree-checkbox-inner"></span>
          </span>
        ` : ''}
        
        <span class="tree-title">${node.title}</span>
        
        ${hasChildren && isExpanded ? `
          <div class="tree-children">
            ${node.children.map(child => this.renderNode(child, level + 1)).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  render() {
    this.container.innerHTML = this.data
      .map(node => this.renderNode(node))
      .join('');
  }

  bindEvents() {
    this.container.addEventListener('click', event => {
      const switcher = event.target.closest('.tree-switcher');
      const checkbox = event.target.closest('.tree-checkbox');
      const node = event.target.closest('.tree-node');
      
      if (!node) return;
      
      const key = node.dataset.key;
      
      if (switcher) {
        this.toggleExpand(key);
      } else if (checkbox) {
        this.toggleCheck(key);
      }
    });
  }

  toggleExpand(key) {
    if (this.expandedKeys.has(key)) {
      this.expandedKeys.delete(key);
    } else {
      this.expandedKeys.add(key);
    }
    this.render();
  }

  toggleCheck(key) {
    const checked = !this.checkedKeys.has(key);
    this.updateNodeCheckStatus(key, checked);
    this.render();
  }

  updateNodeCheckStatus(key, checked) {
    // 更新当前节点
    if (checked) {
      this.checkedKeys.add(key);
    } else {
      this.checkedKeys.delete(key);
    }
    
    // 查找节点
    const findNode = (nodes, targetKey) => {
      for (const node of nodes) {
        if (node.key === targetKey) {
          return node;
        }
        if (node.children) {
          const found = findNode(node.children, targetKey);
          if (found) return found;
        }
      }
      return null;
    };
    
    const node = findNode(this.data, key);
    if (!node) return;
    
    // 更新子节点
    const updateChildren = (children) => {
      if (!children) return;
      children.forEach(child => {
        if (checked) {
          this.checkedKeys.add(child.key);
        } else {
          this.checkedKeys.delete(child.key);
        }
        updateChildren(child.children);
      });
    };
    
    updateChildren(node.children);
    
    // 更新父节点
    const updateParent = (nodes, targetKey) => {
      for (const node of nodes) {
        if (node.children) {
          const hasTarget = node.children.some(child => child.key === targetKey);
          if (hasTarget) {
            const allChecked = node.children.every(child => 
              this.checkedKeys.has(child.key)
            );
            if (allChecked) {
              this.checkedKeys.add(node.key);
            } else {
              this.checkedKeys.delete(node.key);
            }
            updateParent(this.data, node.key);
            return;
          }
          updateParent(node.children, targetKey);
        }
      }
    };
    
    updateParent(this.data, key);
  }

  getCheckedKeys() {
    return Array.from(this.checkedKeys);
  }

  setCheckedKeys(keys) {
    this.checkedKeys = new Set(keys);
    this.render();
  }

  expandAll() {
    const collectKeys = (nodes) => {
      nodes.forEach(node => {
        if (node.children && node.children.length) {
          this.expandedKeys.add(node.key);
          collectKeys(node.children);
        }
      });
    };
    
    collectKeys(this.data);
    this.render();
  }

  collapseAll() {
    this.expandedKeys.clear();
    this.render();
  }
}
```

### 5. 导航组件

#### 5.1 标签页 (Tabs)
```javascript
class Tabs {
  constructor(options = {}) {
    this.items = options.items || [];
    this.activeKey = options.activeKey || (this.items[0] && this.items[0].key);
    this.type = options.type || 'line'; // line, card
    this.onChange = options.onChange;
    this.init();
  }

  init() {
    this.createTabs();
    this.bindEvents();
    this.setActiveTab(this.activeKey);
  }

  createTabs() {
    this.container = document.createElement('div');
    this.container.className = `tabs tabs-${this.type}`;
    
    this.navList = document.createElement('div');
    this.navList.className = 'tabs-nav';
    
    this.contentList = document.createElement('div');
    this.contentList.className = 'tabs-content';
    
    // 渲染标签页头部
    this.navList.innerHTML = this.items.map(item => `
      <div class="tabs-tab" data-key="${item.key}">
        ${item.icon ? `<span class="tabs-tab-icon">${item.icon}</span>` : ''}
        <span class="tabs-tab-text">${item.label}</span>
        ${item.closable ? '<span class="tabs-tab-close">×</span>' : ''}
      </div>
    `).join('');
    
    // 渲染标签页内容
    this.contentList.innerHTML = this.items.map(item => `
      <div class="tabs-panel" data-key="${item.key}">
        ${item.content}
      </div>
    `).join('');
    
    this.container.appendChild(this.navList);
    this.container.appendChild(this.contentList);
  }

  bindEvents() {
    this.navList.addEventListener('click', event => {
      const tab = event.target.closest('.tabs-tab');
      const closeBtn = event.target.closest('.tabs-tab-close');
      
      if (closeBtn) {
        const key = tab.dataset.key;
        this.removeTab(key);
      } else if (tab) {
        const key = tab.dataset.key;
        this.setActiveTab(key);
      }
    });
  }

  setActiveTab(key) {
    if (key === this.activeKey) return;
    
    // 更新标签状态
    const tabs = this.navList.querySelectorAll('.tabs-tab');
    tabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.key === key);
    });
    
    // 更新面板状态
    const panels = this.contentList.querySelectorAll('.tabs-panel');
    panels.forEach(panel => {
      panel.classList.toggle('active', panel.dataset.key === key);
    });
    
    this.activeKey = key;
    
    if (this.onChange) {
      this.onChange(key);
    }
  }

  removeTab(key) {
    const index = this.items.findIndex(item => item.key === key);
    if (index === -1) return;
    
    // 移除标签和面板
    const tab = this.navList.querySelector(`[data-key="${key}"]`);
    const panel = this.contentList.querySelector(`[data-key="${key}"]`);
    
    tab.remove();
    panel.remove();
    
    this.items.splice(index, 1);
    
    // 如果移除的是当前激活的标签，则激活其他标签
    if (key === this.activeKey) {
      const newKey = this.items[index] 
        ? this.items[index].key 
        : (this.items[index - 1] ? this.items[index - 1].key : '');
      
      if (newKey) {
        this.setActiveTab(newKey);
      }
    }
  }

  addTab(item) {
    this.items.push(item);
    
    // 添加标签
    const tab = document.createElement('div');
    tab.className = 'tabs-tab';
    tab.dataset.key = item.key;
    tab.innerHTML = `
      ${item.icon ? `<span class="tabs-tab-icon">${item.icon}</span>` : ''}
      <span class="tabs-tab-text">${item.label}</span>
      ${item.closable ? '<span class="tabs-tab-close">×</span>' : ''}
    `;
    this.navList.appendChild(tab);
    
    // 添加面板
    const panel = document.createElement('div');
    panel.className = 'tabs-panel';
    panel.dataset.key = item.key;
    panel.innerHTML = item.content;
    this.contentList.appendChild(panel);
    
    if (item.active) {
      this.setActiveTab(item.key);
    }
  }
}
```

#### 5.2 轮播图 (Carousel)
```javascript
class Carousel {
  constructor(options = {}) {
    this.items = options.items || [];
    this.autoplay = options.autoplay || false;
    this.interval = options.interval || 3000;
    this.currentIndex = 0;
    this.timer = null;
    this.init();
  }

  init() {
    this.createCarousel();
    this.bindEvents();
    if (this.autoplay) {
      this.startAutoplay();
    }
  }

  createCarousel() {
    this.container = document.createElement('div');
    this.container.className = 'carousel';
    
    // 轮播内容
    this.content = document.createElement('div');
    this.content.className = 'carousel-content';
    
    // 渲染轮播项
    this.content.innerHTML = this.items.map((item, index) => `
      <div class="carousel-item ${index === 0 ? 'active' : ''}" 
           style="transform: translateX(${index * 100}%)">
        <img src="${item.image}" alt="${item.title || ''}">
        ${item.title ? `
          <div class="carousel-caption">
            <h3>${item.title}</h3>
            ${item.description ? `<p>${item.description}</p>` : ''}
          </div>
        ` : ''}
      </div>
    `).join('');
    
    // 导航按钮
    this.prevButton = document.createElement('button');
    this.prevButton.className = 'carousel-prev';
    this.prevButton.innerHTML = '‹';
    
    this.nextButton = document.createElement('button');
    this.nextButton.className = 'carousel-next';
    this.nextButton.innerHTML = '›';
    
    // 指示器
    this.indicators = document.createElement('div');
    this.indicators.className = 'carousel-indicators';
    this.indicators.innerHTML = this.items.map((_, index) => `
      <button class="carousel-indicator ${index === 0 ? 'active' : ''}" 
              data-index="${index}"></button>
    `).join('');
    
    this.container.appendChild(this.content);
    this.container.appendChild(this.prevButton);
    this.container.appendChild(this.nextButton);
    this.container.appendChild(this.indicators);
  }

  bindEvents() {
    // 上一张/下一张
    this.prevButton.addEventListener('click', () => this.prev());
    this.nextButton.addEventListener('click', () => this.next());
    
    // 指示器点击
    this.indicators.addEventListener('click', event => {
      const indicator = event.target.closest('.carousel-indicator');
      if (indicator) {
        const index = parseInt(indicator.dataset.index);
        this.slideTo(index);
      }
    });
    
    // 触摸事件
    let touchStartX = 0;
    let touchEndX = 0;
    
    this.container.addEventListener('touchstart', event => {
      touchStartX = event.touches[0].clientX;
    });
    
    this.container.addEventListener('touchmove', event => {
      touchEndX = event.touches[0].clientX;
      const diff = touchEndX - touchStartX;
      
      // 跟随手指移动
      this.content.style.transform = `translateX(${diff}px)`;
    });
    
    this.container.addEventListener('touchend', () => {
      const diff = touchEndX - touchStartX;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.prev();
        } else {
          this.next();
        }
      }
      
      this.content.style.transform = '';
      this.resumeAutoplay();
    });
    
    // 鼠标悬停暂停自动播放
    this.container.addEventListener('mouseenter', () => this.pauseAutoplay());
    this.container.addEventListener('mouseleave', () => this.resumeAutoplay());
  }

  slideTo(index) {
    if (index === this.currentIndex) return;
    
    this.currentIndex = index;
    
    // 更新轮播项状态
    const items = this.content.querySelectorAll('.carousel-item');
    items.forEach((item, i) => {
      item.classList.toggle('active', i === index);
      item.style.transform = `translateX(${(i - index) * 100}%)`;
    });
  }

  prev() {
    const index = (this.currentIndex - 1 + this.items.length) % this.items.length;
    this.slideTo(index);
  }

  next() {
    const index = (this.currentIndex + 1) % this.items.length;
    this.slideTo(index);
  }

  startAutoplay() {
    if (!this.autoplay) return;
    
    this.timer = setInterval(() => {
      this.next();
    }, this.interval);
  }

  pauseAutoplay() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  resumeAutoplay() {
    if (this.autoplay) {
      this.startAutoplay();
    }
  }
}
```

#### 5.3 日期选择器 (DatePicker)
```javascript
class DatePicker {
  constructor(options = {}) {
    this.value = options.value ? new Date(options.value) : new Date();
    this.format = options.format || 'YYYY-MM-DD';
    this.placeholder = options.placeholder || '请选择日期';
    this.min = options.min ? new Date(options.min) : null;
    this.max = options.max ? new Date(options.max) : null;
    this.onChange = options.onChange;
    this.init();
  }

  init() {
    this.createDatePicker();
    this.bindEvents();
    this.updateInput();
  }

  createDatePicker() {
    this.container = document.createElement('div');
    this.container.className = 'date-picker';
    
    // 输入框
    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.className = 'date-picker-input';
    this.input.placeholder = this.placeholder;
    this.input.readOnly = true;
    
    // 日期面板
    this.panel = document.createElement('div');
    this.panel.className = 'date-picker-panel';
    
    this.container.appendChild(this.input);
    this.container.appendChild(this.panel);
    
    this.renderPanel();
  }

  renderPanel() {
    const year = this.value.getFullYear();
    const month = this.value.getMonth();
    const date = this.value.getDate();
    
    // 获取当月第一天是星期几
    const firstDay = new Date(year, month, 1).getDay();
    // 获取当月天数
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // 获取上个月天数
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    // 日历头部
    const header = `
      <div class="date-picker-header">
        <button class="prev-year">«</button>
        <button class="prev-month">‹</button>
        <span class="current-date">${year}年${month + 1}月</span>
        <button class="next-month">›</button>
        <button class="next-year">»</button>
      </div>
    `;
    
    // 星期行
    const weeks = `
      <div class="date-picker-weeks">
        <span>日</span>
        <span>一</span>
        <span>二</span>
        <span>三</span>
        <span>四</span>
        <span>五</span>
        <span>六</span>
      </div>
    `;
    
    // 日期格子
    let days = '';
    let day = 1;
    
    // 上个月的日期
    for (let i = firstDay - 1; i >= 0; i--) {
      const prevDate = daysInPrevMonth - i;
      days += `
        <span class="date-cell prev-month-cell" 
              data-date="${year}-${month}-${prevDate}">
          ${prevDate}
        </span>
      `;
    }
    
    // 当月的日期
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = this.isToday(year, month, i);
      const isSelected = this.isSelected(year, month, i);
      const isDisabled = this.isDisabled(year, month, i);
      
      days += `
        <span class="date-cell current-month-cell
                     ${isToday ? 'today' : ''}
                     ${isSelected ? 'selected' : ''}
                     ${isDisabled ? 'disabled' : ''}"
              data-date="${year}-${month + 1}-${i}">
          ${i}
        </span>
      `;
    }
    
    // 下个月的日期
    let nextMonthDay = 1;
    while (day <= 42) {
      days += `
        <span class="date-cell next-month-cell" 
              data-date="${year}-${month + 2}-${nextMonthDay}">
          ${nextMonthDay}
        </span>
      `;
      nextMonthDay++;
      day++;
    }
    
    this.panel.innerHTML = `
      ${header}
      <div class="date-picker-body">
        ${weeks}
        <div class="date-picker-dates">
          ${days}
        </div>
      </div>
    `;
  }

  bindEvents() {
    // 显示/隐藏面板
    this.input.addEventListener('click', () => {
      this.panel.classList.toggle('visible');
    });
    
    // 点击外部关闭面板
    document.addEventListener('click', event => {
      if (!this.container.contains(event.target)) {
        this.panel.classList.remove('visible');
      }
    });
    
    // 日期选择
    this.panel.addEventListener('click', event => {
      const cell = event.target.closest('.date-cell');
      if (cell && !cell.classList.contains('disabled')) {
        const [year, month, date] = cell.dataset.date.split('-').map(Number);
        this.selectDate(year, month - 1, date);
      }
    });
    
    // 月份切换
    const prevMonthBtn = this.panel.querySelector('.prev-month');
    const nextMonthBtn = this.panel.querySelector('.next-month');
    const prevYearBtn = this.panel.querySelector('.prev-year');
    const nextYearBtn = this.panel.querySelector('.next-year');
    
    prevMonthBtn.addEventListener('click', () => this.changeMonth(-1));
    nextMonthBtn.addEventListener('click', () => this.changeMonth(1));
    prevYearBtn.addEventListener('click', () => this.changeYear(-1));
    nextYearBtn.addEventListener('click', () => this.changeYear(1));
  }

  selectDate(year, month, date) {
    this.value = new Date(year, month, date);
    this.updateInput();
    this.renderPanel();
    this.panel.classList.remove('visible');
    
    if (this.onChange) {
      this.onChange(this.value);
    }
  }

  changeMonth(diff) {
    const newDate = new Date(this.value);
    newDate.setMonth(newDate.getMonth() + diff);
    this.value = newDate;
    this.renderPanel();
  }

  changeYear(diff) {
    const newDate = new Date(this.value);
    newDate.setFullYear(newDate.getFullYear() + diff);
    this.value = newDate;
    this.renderPanel();
  }

  updateInput() {
    this.input.value = this.formatDate(this.value);
  }

  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return this.format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day);
  }

  isToday(year, month, date) {
    const today = new Date();
    return (
      year === today.getFullYear() &&
      month === today.getMonth() &&
      date === today.getDate()
    );
  }

  isSelected(year, month, date) {
    return (
      year === this.value.getFullYear() &&
      month === this.value.getMonth() &&
      date === this.value.getDate()
    );
  }

  isDisabled(year, month, date) {
    const currentDate = new Date(year, month, date);
    
    if (this.min && currentDate < this.min) return true;
    if (this.max && currentDate > this.max) return true;
    
    return false;
  }
}
```

### 6. 表单验证组件

#### 6.1 验证器 (Validator)
```javascript
class Validator {
  static rules = {
    required: {
      validate: value => value !== undefined && value !== null && value !== '',
      message: '该字段为必填项'
    },
    
    email: {
      validate: value => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value),
      message: '请输入有效的邮箱地址'
    },
    
    phone: {
      validate: value => /^1[3-9]\d{9}$/.test(value),
      message: '请输入有效的手机号码'
    },
    
    url: {
      validate: value => /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(value),
      message: '请输入有效的URL地址'
    },
    
    number: {
      validate: value => !isNaN(parseFloat(value)) && isFinite(value),
      message: '请输入有效的数字'
    },
    
    integer: {
      validate: value => Number.isInteger(Number(value)),
      message: '请输入有效的整数'
    },
    
    min: (min) => ({
      validate: value => Number(value) >= min,
      message: `最小值为 ${min}`
    }),
    
    max: (max) => ({
      validate: value => Number(value) <= max,
      message: `最大值为 ${max}`
    }),
    
    minLength: (min) => ({
      validate: value => String(value).length >= min,
      message: `最小长度为 ${min} 个字符`
    }),
    
    maxLength: (max) => ({
      validate: value => String(value).length <= max,
      message: `最大长度为 ${max} 个字符`
    }),
    
    pattern: (pattern) => ({
      validate: value => pattern.test(value),
      message: '格式不正确'
    }),
    
    custom: (validator) => ({
      validate: validator,
      message: '验证失败'
    })
  };

  constructor(rules = {}) {
    this.rules = rules;
  }

  async validate(values) {
    const errors = {};
    const fields = Object.keys(this.rules);
    
    for (const field of fields) {
      const fieldRules = this.rules[field];
      const value = values[field];
      
      for (const rule of fieldRules) {
        try {
          if (typeof rule === 'string') {
            // 预定义规则
            const validator = Validator.rules[rule];
            if (!validator.validate(value)) {
              errors[field] = validator.message;
              break;
            }
          } else if (typeof rule === 'object') {
            // 自定义规则
            const { type, message, ...params } = rule;
            const validator = typeof type === 'function' 
              ? type(params)
              : Validator.rules[type](params);
            
            if (!validator.validate(value)) {
              errors[field] = message || validator.message;
              break;
            }
          }
        } catch (error) {
          errors[field] = '验证过程出错';
          break;
        }
      }
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }

  addRule(name, validator) {
    Validator.rules[name] = validator;
  }
}
```

#### 6.2 表单验证 (FormValidation)
```javascript
class FormValidation {
  constructor(options = {}) {
    this.form = options.form;
    this.rules = options.rules || {};
    this.messages = options.messages || {};
    this.validator = new Validator(this.rules);
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // 实时验证
    this.form.addEventListener('input', event => {
      const field = event.target.name;
      if (this.rules[field]) {
        this.validateField(field);
      }
    });
    
    // 提交验证
    this.form.addEventListener('submit', async event => {
      event.preventDefault();
      
      if (await this.validateForm()) {
        // 验证通过，提交表单
        this.submitForm();
      }
    });
  }

  async validateField(field) {
    const value = this.form.elements[field].value;
    const result = await this.validator.validate({
      [field]: value
    });
    
    this.showFieldError(field, result.errors[field]);
    return !result.errors[field];
  }

  async validateForm() {
    const values = this.getFormValues();
    const result = await this.validator.validate(values);
    
    Object.keys(this.rules).forEach(field => {
      this.showFieldError(field, result.errors[field]);
    });
    
    return result.valid;
  }

  showFieldError(field, error) {
    const element = this.form.elements[field];
    const container = element.closest('.form-item');
    if (!container) return;
    
    const errorElement = container.querySelector('.form-item-error');
    if (!errorElement) return;
    
    if (error) {
      element.classList.add('error');
      errorElement.textContent = this.messages[field]?.[error] || error;
    } else {
      element.classList.remove('error');
      errorElement.textContent = '';
    }
  }

  getFormValues() {
    const values = {};
    const elements = this.form.elements;
    
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if (!element.name) continue;
      
      switch (element.type) {
        case 'radio':
          if (element.checked) {
            values[element.name] = element.value;
          }
          break;
        
        case 'checkbox':
          if (!values[element.name]) {
            values[element.name] = [];
          }
          if (element.checked) {
            values[element.name].push(element.value);
          }
          break;
        
        case 'file':
          values[element.name] = element.files;
          break;
        
        default:
          values[element.name] = element.value;
      }
    }
    
    return values;
  }

  async submitForm() {
    const values = this.getFormValues();
    try {
      // 这里可以发送请求到服务器
      console.log('Form submitted:', values);
    } catch (error) {
      console.error('Form submission failed:', error);
    }
  }

  reset() {
    this.form.reset();
    const errorElements = this.form.querySelectorAll('.form-item-error');
    errorElements.forEach(element => {
      element.textContent = '';
    });
    
    const inputElements = this.form.querySelectorAll('.error');
    inputElements.forEach(element => {
      element.classList.remove('error');
    });
  }
}
```

### 7. 数据可视化组件

#### 7.1 图表基类 (Chart)
```javascript
class Chart {
  constructor(options = {}) {
    this.container = options.container;
    this.width = options.width || 600;
    this.height = options.height || 400;
    this.margin = options.margin || { top: 20, right: 20, bottom: 30, left: 40 };
    this.data = options.data || [];
    this.init();
  }

  init() {
    this.createCanvas();
    this.createScales();
    this.createAxes();
    this.render();
  }

  createCanvas() {
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width', this.width);
    this.svg.setAttribute('height', this.height);
    this.container.appendChild(this.svg);
    
    this.chart = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.chart.setAttribute('transform', 
      `translate(${this.margin.left},${this.margin.top})`);
    this.svg.appendChild(this.chart);
  }

  createScales() {
    // 由子类实现
  }

  createAxes() {
    // 由子类实现
  }

  render() {
    // 由子类实现
  }

  update(data) {
    this.data = data;
    this.render();
  }

  clear() {
    while (this.chart.firstChild) {
      this.chart.removeChild(this.chart.firstChild);
    }
  }

  destroy() {
    this.svg.remove();
  }
}
```

#### 7.2 柱状图 (BarChart)
```javascript
class BarChart extends Chart {
  constructor(options = {}) {
    super(options);
    this.barPadding = options.barPadding || 0.1;
    this.colors = options.colors || ['#4CAF50'];
  }

  createScales() {
    const chartWidth = this.width - this.margin.left - this.margin.right;
    const chartHeight = this.height - this.margin.top - this.margin.bottom;
    
    // X轴比例尺
    this.xScale = d3.scaleBand()
      .domain(this.data.map(d => d.label))
      .range([0, chartWidth])
      .padding(this.barPadding);
    
    // Y轴比例尺
    this.yScale = d3.scaleLinear()
      .domain([0, d3.max(this.data, d => d.value)])
      .range([chartHeight, 0]);
  }

  createAxes() {
    // X轴
    const xAxis = d3.axisBottom(this.xScale);
    const xAxisGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    xAxisGroup.setAttribute('transform', 
      `translate(0,${this.height - this.margin.top - this.margin.bottom})`);
    xAxisGroup.call(xAxis);
    this.chart.appendChild(xAxisGroup);
    
    // Y轴
    const yAxis = d3.axisLeft(this.yScale);
    const yAxisGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    yAxisGroup.call(yAxis);
    this.chart.appendChild(yAxisGroup);
  }

  render() {
    this.clear();
    this.createScales();
    this.createAxes();
    
    // 绘制柱子
    this.data.forEach((d, i) => {
      const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bar.setAttribute('x', this.xScale(d.label));
      bar.setAttribute('y', this.yScale(d.value));
      bar.setAttribute('width', this.xScale.bandwidth());
      bar.setAttribute('height', 
        this.height - this.margin.top - this.margin.bottom - this.yScale(d.value));
      bar.setAttribute('fill', this.colors[i % this.colors.length]);
      
      // 添加动画
      bar.style.transition = 'height 0.3s ease-in-out';
      
      // 添加交互
      bar.addEventListener('mouseenter', () => {
        bar.setAttribute('fill-opacity', '0.8');
        this.showTooltip(d, event);
      });
      
      bar.addEventListener('mouseleave', () => {
        bar.setAttribute('fill-opacity', '1');
        this.hideTooltip();
      });
      
      this.chart.appendChild(bar);
    });
  }

  showTooltip(data, event) {
    let tooltip = document.getElementById('chart-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'chart-tooltip';
      tooltip.className = 'chart-tooltip';
      document.body.appendChild(tooltip);
    }
    
    tooltip.innerHTML = `
      <div class="tooltip-label">${data.label}</div>
      <div class="tooltip-value">${data.value}</div>
    `;
    
    const rect = this.svg.getBoundingClientRect();
    tooltip.style.left = `${event.clientX - rect.left + 10}px`;
    tooltip.style.top = `${event.clientY - rect.top - 25}px`;
    tooltip.style.display = 'block';
  }

  hideTooltip() {
    const tooltip = document.getElementById('chart-tooltip');
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  }
}
```

#### 7.3 折线图 (LineChart)
```javascript
class LineChart extends Chart {
  constructor(options = {}) {
    super(options);
    this.lineColor = options.lineColor || '#2196F3';
    this.lineWidth = options.lineWidth || 2;
    this.showPoints = options.showPoints !== false;
    this.pointRadius = options.pointRadius || 4;
    this.pointColor = options.pointColor || '#FFF';
    this.areaColor = options.areaColor;
  }

  createScales() {
    const chartWidth = this.width - this.margin.left - this.margin.right;
    const chartHeight = this.height - this.margin.top - this.margin.bottom;
    
    // X轴比例尺
    this.xScale = d3.scalePoint()
      .domain(this.data.map(d => d.label))
      .range([0, chartWidth]);
    
    // Y轴比例尺
    this.yScale = d3.scaleLinear()
      .domain([0, d3.max(this.data, d => d.value)])
      .range([chartHeight, 0]);
  }

  createAxes() {
    // X轴
    const xAxis = d3.axisBottom(this.xScale);
    const xAxisGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    xAxisGroup.setAttribute('transform', 
      `translate(0,${this.height - this.margin.top - this.margin.bottom})`);
    xAxisGroup.call(xAxis);
    this.chart.appendChild(xAxisGroup);
    
    // Y轴
    const yAxis = d3.axisLeft(this.yScale);
    const yAxisGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    yAxisGroup.call(yAxis);
    this.chart.appendChild(yAxisGroup);
  }

  render() {
    this.clear();
    this.createScales();
    this.createAxes();
    
    // 创建线条生成器
    const line = d3.line()
      .x(d => this.xScale(d.label))
      .y(d => this.yScale(d.value));
    
    // 如果需要显示区域
    if (this.areaColor) {
      const area = d3.area()
        .x(d => this.xScale(d.label))
        .y0(this.height - this.margin.top - this.margin.bottom)
        .y1(d => this.yScale(d.value));
      
      const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      areaPath.setAttribute('d', area(this.data));
      areaPath.setAttribute('fill', this.areaColor);
      areaPath.setAttribute('fill-opacity', '0.1');
      this.chart.appendChild(areaPath);
    }
    
    // 绘制线条
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', line(this.data));
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', this.lineColor);
    path.setAttribute('stroke-width', this.lineWidth);
    
    // 添加动画
    const length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
    path.style.transition = 'stroke-dashoffset 1s ease-in-out';
    
    requestAnimationFrame(() => {
      path.style.strokeDashoffset = '0';
    });
    
    this.chart.appendChild(path);
    
    // 绘制数据点
    if (this.showPoints) {
      this.data.forEach(d => {
        const point = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        point.setAttribute('cx', this.xScale(d.label));
        point.setAttribute('cy', this.yScale(d.value));
        point.setAttribute('r', this.pointRadius);
        point.setAttribute('fill', this.pointColor);
        point.setAttribute('stroke', this.lineColor);
        point.setAttribute('stroke-width', '2');
        
        // 添加交互
        point.addEventListener('mouseenter', () => {
          point.setAttribute('r', this.pointRadius * 1.5);
          this.showTooltip(d, event);
        });
        
        point.addEventListener('mouseleave', () => {
          point.setAttribute('r', this.pointRadius);
          this.hideTooltip();
        });
        
        this.chart.appendChild(point);
      });
    }
  }

  showTooltip(data, event) {
    let tooltip = document.getElementById('chart-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'chart-tooltip';
      tooltip.className = 'chart-tooltip';
      document.body.appendChild(tooltip);
    }
    
    tooltip.innerHTML = `
      <div class="tooltip-label">${data.label}</div>
      <div class="tooltip-value">${data.value}</div>
    `;
    
    const rect = this.svg.getBoundingClientRect();
    tooltip.style.left = `${event.clientX - rect.left + 10}px`;
    tooltip.style.top = `${event.clientY - rect.top - 25}px`;
    tooltip.style.display = 'block';
  }

  hideTooltip() {
    const tooltip = document.getElementById('chart-tooltip');
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  }
}
```

#### 7.4 饼图 (PieChart)
```javascript
class PieChart extends Chart {
  constructor(options = {}) {
    super(options);
    this.colors = options.colors || [
      '#2196F3', '#4CAF50', '#FFC107', '#E91E63',
      '#9C27B0', '#FF5722', '#795548', '#607D8B'
    ];
    this.innerRadius = options.innerRadius || 0; // 设置为 > 0 可以创建环形图
    this.padAngle = options.padAngle || 0;
    this.cornerRadius = options.cornerRadius || 0;
    this.labelOffset = options.labelOffset || 20;
  }

  createScales() {
    const total = this.data.reduce((sum, d) => sum + d.value, 0);
    this.data = this.data.map(d => ({
      ...d,
      percentage: (d.value / total * 100).toFixed(1)
    }));
  }

  render() {
    this.clear();
    this.createScales();
    
    const radius = Math.min(
      this.width - this.margin.left - this.margin.right,
      this.height - this.margin.top - this.margin.bottom
    ) / 2;
    
    // 创建弧形生成器
    const arc = d3.arc()
      .innerRadius(this.innerRadius)
      .outerRadius(radius)
      .padAngle(this.padAngle)
      .cornerRadius(this.cornerRadius);
    
    // 创建饼图生成器
    const pie = d3.pie()
      .value(d => d.value)
      .sort(null);
    
    const pieData = pie(this.data);
    
    // 创建图形组，并移动到中心
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${this.width/2},${this.height/2})`);
    this.chart.appendChild(g);
    
    // 绘制扇形
    pieData.forEach((d, i) => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', arc(d));
      path.setAttribute('fill', this.colors[i % this.colors.length]);
      
      // 添加动画
      path.style.transition = 'all 0.3s ease-in-out';
      
      // 添加交互
      path.addEventListener('mouseenter', () => {
        path.style.transform = 'scale(1.05)';
        this.showTooltip(d.data, event);
      });
      
      path.addEventListener('mouseleave', () => {
        path.style.transform = 'scale(1)';
        this.hideTooltip();
      });
      
      g.appendChild(path);
      
      // 添加标签
      if (d.data.value / this.data.reduce((sum, d) => sum + d.value, 0) > 0.05) {
        const centroid = arc.centroid(d);
        const x = centroid[0] * (1 + this.labelOffset / 100);
        const y = centroid[1] * (1 + this.labelOffset / 100);
        
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', x);
        label.setAttribute('y', y);
        label.setAttribute('text-anchor', x > 0 ? 'start' : 'end');
        label.setAttribute('alignment-baseline', 'middle');
        label.textContent = `${d.data.label} (${d.data.percentage}%)`;
        
        g.appendChild(label);
      }
    });
    
    // 添加中心文本（如果是环形图）
    if (this.innerRadius > 0) {
      const total = this.data.reduce((sum, d) => sum + d.value, 0);
      const centerText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      centerText.setAttribute('text-anchor', 'middle');
      centerText.setAttribute('alignment-baseline', 'middle');
      centerText.textContent = total;
      g.appendChild(centerText);
    }
  }

  showTooltip(data, event) {
    let tooltip = document.getElementById('chart-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'chart-tooltip';
      tooltip.className = 'chart-tooltip';
      document.body.appendChild(tooltip);
    }
    
    tooltip.innerHTML = `
      <div class="tooltip-label">${data.label}</div>
      <div class="tooltip-value">${data.value} (${data.percentage}%)</div>
    `;
    
    const rect = this.svg.getBoundingClientRect();
    tooltip.style.left = `${event.clientX - rect.left + 10}px`;
    tooltip.style.top = `${event.clientY - rect.top - 25}px`;
    tooltip.style.display = 'block';
  }

  hideTooltip() {
    const tooltip = document.getElementById('chart-tooltip');
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  }
}
```

### 8. 工具组件

#### 8.1 虚拟滚动 (VirtualScroll)
```javascript
class VirtualScroll {
  constructor(options = {}) {
    this.container = options.container;
    this.itemHeight = options.itemHeight || 30;
    this.bufferSize = options.bufferSize || 5;
    this.items = options.items || [];
    this.renderItem = options.renderItem || (item => item.toString());
    this.init();
  }

  init() {
    this.createScroller();
    this.bindEvents();
    this.render();
  }

  createScroller() {
    // 容器设置
    this.container.style.overflow = 'auto';
    this.container.style.position = 'relative';
    
    // 创建占位容器
    this.placeholder = document.createElement('div');
    this.placeholder.style.width = '100%';
    
    // 创建内容容器
    this.content = document.createElement('div');
    this.content.style.position = 'absolute';
    this.content.style.top = '0';
    this.content.style.left = '0';
    this.content.style.width = '100%';
    
    this.container.appendChild(this.placeholder);
    this.container.appendChild(this.content);
  }

  bindEvents() {
    this.container.addEventListener('scroll', () => {
      requestAnimationFrame(() => this.render());
    });
    
    // 监听容器大小变化
    if (window.ResizeObserver) {
      const observer = new ResizeObserver(() => {
        this.render();
      });
      observer.observe(this.container);
    }
  }

  render() {
    const { scrollTop, clientHeight } = this.container;
    
    // 计算可见区域的起始和结束索引
    const startIndex = Math.floor(scrollTop / this.itemHeight);
    const endIndex = Math.ceil((scrollTop + clientHeight) / this.itemHeight);
    
    // 添加缓冲区
    const renderStartIndex = Math.max(0, startIndex - this.bufferSize);
    const renderEndIndex = Math.min(
      this.items.length,
      endIndex + this.bufferSize
    );
    
    // 更新占位容器高度
    this.placeholder.style.height = `${this.items.length * this.itemHeight}px`;
    
    // 更新内容容器位置
    this.content.style.transform = `translateY(${renderStartIndex * this.itemHeight}px)`;
    
    // 渲染可见项
    const visibleItems = this.items.slice(renderStartIndex, renderEndIndex);
    this.content.innerHTML = visibleItems.map((item, index) => `
      <div class="virtual-item" style="height: ${this.itemHeight}px">
        ${this.renderItem(item, renderStartIndex + index)}
      </div>
    `).join('');
  }

  scrollToIndex(index) {
    this.container.scrollTop = index * this.itemHeight;
  }

  updateItems(items) {
    this.items = items;
    this.render();
  }
}
```

#### 8.2 无限滚动 (InfiniteScroll)
```javascript
class InfiniteScroll {
  constructor(options = {}) {
    this.container = options.container;
    this.loadMore = options.loadMore;
    this.threshold = options.threshold || 100;
    this.pageSize = options.pageSize || 20;
    this.currentPage = 1;
    this.loading = false;
    this.hasMore = true;
    this.init();
  }

  init() {
    this.createLoader();
    this.bindEvents();
    this.load();
  }

  createLoader() {
    this.loader = document.createElement('div');
    this.loader.className = 'infinite-loader';
    this.loader.innerHTML = `
      <div class="loader-spinner"></div>
      <div class="loader-text">加载中...</div>
    `;
    this.loader.style.display = 'none';
    
    this.container.appendChild(this.loader);
  }

  bindEvents() {
    // 使用 Intersection Observer 监听加载触发器
    if (window.IntersectionObserver) {
      this.observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && !this.loading && this.hasMore) {
          this.load();
        }
      }, {
        root: null,
        rootMargin: `${this.threshold}px`,
        threshold: 0
      });
      
      this.observer.observe(this.loader);
    } else {
      // 降级方案：使用滚动事件
      this.container.addEventListener('scroll', () => {
        if (this.shouldLoad()) {
          this.load();
        }
      });
    }
  }

  shouldLoad() {
    if (this.loading || !this.hasMore) return false;
    
    const { scrollTop, clientHeight, scrollHeight } = this.container;
    return scrollHeight - scrollTop - clientHeight <= this.threshold;
  }

  async load() {
    if (this.loading || !this.hasMore) return;
    
    this.loading = true;
    this.showLoader();
    
    try {
      const { items, hasMore } = await this.loadMore(this.currentPage, this.pageSize);
      
      this.hasMore = hasMore;
      this.currentPage++;
      
      if (!hasMore) {
        this.showNoMore();
      }
    } catch (error) {
      this.showError();
      console.error('Failed to load more items:', error);
    } finally {
      this.loading = false;
      this.hideLoader();
    }
  }

  showLoader() {
    this.loader.style.display = 'flex';
    this.loader.innerHTML = `
      <div class="loader-spinner"></div>
      <div class="loader-text">加载中...</div>
    `;
  }

  hideLoader() {
    this.loader.style.display = 'none';
  }

  showNoMore() {
    this.loader.style.display = 'flex';
    this.loader.innerHTML = `
      <div class="loader-text">没有更多数据了</div>
    `;
  }

  showError() {
    this.loader.style.display = 'flex';
    this.loader.innerHTML = `
      <div class="loader-text">加载失败，点击重试</div>
    `;
    
    this.loader.addEventListener('click', () => {
      this.load();
    }, { once: true });
  }

  reset() {
    this.currentPage = 1;
    this.hasMore = true;
    this.loading = false;
    this.hideLoader();
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.loader.remove();
  }
}
```

#### 8.3 拖拽排序 (DragSort)
```javascript
class DragSort {
  constructor(options = {}) {
    this.container = options.container;
    this.items = options.items || [];
    this.renderItem = options.renderItem || (item => item.toString());
    this.onSort = options.onSort;
    this.dragClass = options.dragClass || 'dragging';
    this.init();
  }

  init() {
    this.createList();
    this.bindEvents();
  }

  createList() {
    this.list = document.createElement('div');
    this.list.className = 'drag-sort-list';
    
    this.renderList();
    this.container.appendChild(this.list);
  }

  renderList() {
    this.list.innerHTML = this.items.map((item, index) => `
      <div class="drag-sort-item" draggable="true" data-index="${index}">
        ${this.renderItem(item, index)}
      </div>
    `).join('');
  }

  bindEvents() {
    this.list.addEventListener('dragstart', event => {
      const item = event.target.closest('.drag-sort-item');
      if (!item) return;
      
      item.classList.add(this.dragClass);
      event.dataTransfer.setData('text/plain', item.dataset.index);
      event.dataTransfer.effectAllowed = 'move';
    });
    
    this.list.addEventListener('dragend', event => {
      const item = event.target.closest('.drag-sort-item');
      if (!item) return;
      
      item.classList.remove(this.dragClass);
    });
    
    this.list.addEventListener('dragover', event => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      
      const item = event.target.closest('.drag-sort-item');
      if (!item) return;
      
      const draggingItem = this.list.querySelector(`.${this.dragClass}`);
      if (item === draggingItem) return;
      
      const rect = item.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      
      if (event.clientY < midY) {
        item.parentNode.insertBefore(draggingItem, item);
      } else {
        item.parentNode.insertBefore(draggingItem, item.nextSibling);
      }
    });
    
    this.list.addEventListener('drop', event => {
      event.preventDefault();
      
      const fromIndex = parseInt(event.dataTransfer.getData('text/plain'));
      const items = Array.from(this.list.children);
      const toIndex = items.indexOf(items.find(item => 
        item.classList.contains(this.dragClass)
      ));
      
      if (fromIndex === toIndex) return;
      
      // 更新数据
      const [movedItem] = this.items.splice(fromIndex, 1);
      this.items.splice(toIndex, 0, movedItem);
      
      if (this.onSort) {
        this.onSort(this.items, fromIndex, toIndex);
      }
    });
  }

  updateItems(items) {
    this.items = items;
    this.renderList();
  }

  getItems() {
    return [...this.items];
  }
}
```

#### 8.4 富文本编辑器 (RichTextEditor)
```javascript
class RichTextEditor {
  constructor(options = {}) {
    this.container = options.container;
    this.value = options.value || '';
    this.toolbar = options.toolbar || [
      ['bold', 'italic', 'underline', 'strike'],
      ['h1', 'h2', 'h3', 'p'],
      ['ul', 'ol', 'blockquote'],
      ['link', 'image'],
      ['undo', 'redo']
    ];
    this.init();
  }

  init() {
    this.createEditor();
    this.bindEvents();
    this.setupToolbar();
  }

  createEditor() {
    this.editor = document.createElement('div');
    this.editor.className = 'rich-text-editor';
    
    // 工具栏
    this.toolbarElement = document.createElement('div');
    this.toolbarElement.className = 'editor-toolbar';
    
    // 编辑区域
    this.contentElement = document.createElement('div');
    this.contentElement.className = 'editor-content';
    this.contentElement.contentEditable = true;
    this.contentElement.innerHTML = this.value;
    
    this.editor.appendChild(this.toolbarElement);
    this.editor.appendChild(this.contentElement);
    this.container.appendChild(this.editor);
  }

  setupToolbar() {
    this.toolbar.forEach(group => {
      const groupElement = document.createElement('div');
      groupElement.className = 'toolbar-group';
      
      group.forEach(item => {
        const button = document.createElement('button');
        button.className = `toolbar-button ${item}`;
        button.innerHTML = this.getToolbarIcon(item);
        button.addEventListener('click', () => this.handleToolbarClick(item));
        groupElement.appendChild(button);
      });
      
      this.toolbarElement.appendChild(groupElement);
    });
  }

  getToolbarIcon(command) {
    const icons = {
      bold: 'B',
      italic: 'I',
      underline: 'U',
      strike: 'S',
      h1: 'H1',
      h2: 'H2',
      h3: 'H3',
      p: 'P',
      ul: '•',
      ol: '1.',
      blockquote: '❝',
      link: '🔗',
      image: '🖼',
      undo: '↩',
      redo: '↪'
    };
    return icons[command] || command;
  }

  handleToolbarClick(command) {
    switch (command) {
      case 'bold':
      case 'italic':
      case 'underline':
      case 'strike':
        document.execCommand(command, false, null);
        break;
        
      case 'h1':
      case 'h2':
      case 'h3':
      case 'p':
        document.execCommand('formatBlock', false, command);
        break;
        
      case 'ul':
      case 'ol':
        document.execCommand('insertList', false, command === 'ul' ? 'false' : 'true');
        break;
        
      case 'blockquote':
        document.execCommand('formatBlock', false, 'blockquote');
        break;
        
      case 'link':
        const url = prompt('请输入链接地址:');
        if (url) {
          document.execCommand('createLink', false, url);
        }
        break;
        
      case 'image':
        const imageUrl = prompt('请输入图片地址:');
        if (imageUrl) {
          document.execCommand('insertImage', false, imageUrl);
        }
        break;
        
      case 'undo':
        document.execCommand('undo', false, null);
        break;
        
      case 'redo':
        document.execCommand('redo', false, null);
        break;
    }
  }

  bindEvents() {
    this.contentElement.addEventListener('input', () => {
      this.value = this.contentElement.innerHTML;
    });
    
    this.contentElement.addEventListener('paste', event => {
      event.preventDefault();
      const text = event.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    });
    
    // 键盘快捷键
    this.contentElement.addEventListener('keydown', event => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'b':
            event.preventDefault();
            document.execCommand('bold', false, null);
            break;
          case 'i':
            event.preventDefault();
            document.execCommand('italic', false, null);
            break;
          case 'u':
            event.preventDefault();
            document.execCommand('underline', false, null);
            break;
          case 'z':
            event.preventDefault();
            document.execCommand('undo', false, null);
            break;
          case 'y':
            event.preventDefault();
            document.execCommand('redo', false, null);
            break;
        }
      }
    });
  }

  getValue() {
    return this.contentElement.innerHTML;
  }

  setValue(value) {
    this.value = value;
    this.contentElement.innerHTML = value;
  }

  focus() {
    this.contentElement.focus();
  }

  destroy() {
    this.editor.remove();
  }
}
```

#### 8.5 颜色选择器 (ColorPicker)
```javascript
class ColorPicker {
  constructor(options = {}) {
    this.container = options.container;
    this.value = options.value || '#000000';
    this.onChange = options.onChange;
    this.init();
  }

  init() {
    this.createPicker();
    this.bindEvents();
    this.updateColor(this.value);
  }

  createPicker() {
    this.picker = document.createElement('div');
    this.picker.className = 'color-picker';
    
    // 颜色预览
    this.preview = document.createElement('div');
    this.preview.className = 'color-preview';
    
    // 颜色选择区域
    this.selector = document.createElement('div');
    this.selector.className = 'color-selector';
    
    // 色相滑块
    this.hueSlider = document.createElement('input');
    this.hueSlider.type = 'range';
    this.hueSlider.min = '0';
    this.hueSlider.max = '360';
    this.hueSlider.className = 'hue-slider';
    
    // RGB 输入框
    this.rgbInputs = document.createElement('div');
    this.rgbInputs.className = 'rgb-inputs';
    
    ['R', 'G', 'B'].forEach(channel => {
      const input = document.createElement('input');
      input.type = 'number';
      input.min = '0';
      input.max = '255';
      input.className = `rgb-input ${channel.toLowerCase()}`;
      this.rgbInputs.appendChild(input);
    });
    
    // HEX 输入框
    this.hexInput = document.createElement('input');
    this.hexInput.type = 'text';
    this.hexInput.className = 'hex-input';
    this.hexInput.maxLength = '7';
    
    this.picker.appendChild(this.preview);
    this.picker.appendChild(this.selector);
    this.picker.appendChild(this.hueSlider);
    this.picker.appendChild(this.rgbInputs);
    this.picker.appendChild(this.hexInput);
    this.container.appendChild(this.picker);
  }

  bindEvents() {
    // 色相滑块
    this.hueSlider.addEventListener('input', () => {
      const hue = this.hueSlider.value;
      this.updateColorFromHue(hue);
    });
    
    // RGB 输入框
    this.rgbInputs.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', () => {
        const r = this.rgbInputs.querySelector('.r').value;
        const g = this.rgbInputs.querySelector('.g').value;
        const b = this.rgbInputs.querySelector('.b').value;
        this.updateColorFromRGB(r, g, b);
      });
    });
    
    // HEX 输入框
    this.hexInput.addEventListener('input', () => {
      const hex = this.hexInput.value;
      if (this.isValidHex(hex)) {
        this.updateColorFromHex(hex);
      }
    });
    
    // 颜色选择区域
    this.selector.addEventListener('mousedown', event => {
      const rect = this.selector.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      this.updateColorFromPosition(x, y);
      
      const moveHandler = (event) => {
        const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
        const y = Math.max(0, Math.min(event.clientY - rect.top, rect.height));
        this.updateColorFromPosition(x, y);
      };
      
      const upHandler = () => {
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('mouseup', upHandler);
      };
      
      document.addEventListener('mousemove', moveHandler);
      document.addEventListener('mouseup', upHandler);
    });
  }

  updateColor(color) {
    this.value = color;
    this.preview.style.backgroundColor = color;
    
    // 更新 RGB 值
    const rgb = this.hexToRgb(color);
    this.rgbInputs.querySelector('.r').value = rgb.r;
    this.rgbInputs.querySelector('.g').value = rgb.g;
    this.rgbInputs.querySelector('.b').value = rgb.b;
    
    // 更新 HEX 值
    this.hexInput.value = color;
    
    // 更新色相滑块
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    this.hueSlider.value = hsl.h;
    
    if (this.onChange) {
      this.onChange(color);
    }
  }

  updateColorFromHue(hue) {
    const rgb = this.hslToRgb(hue, 100, 50);
    const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);
    this.updateColor(hex);
  }

  updateColorFromRGB(r, g, b) {
    const hex = this.rgbToHex(r, g, b);
    this.updateColor(hex);
  }

  updateColorFromHex(hex) {
    this.updateColor(hex);
  }

  updateColorFromPosition(x, y) {
    const rect = this.selector.getBoundingClientRect();
    const saturation = (x / rect.width) * 100;
    const lightness = 100 - (y / rect.height) * 100;
    const hue = this.hueSlider.value;
    
    const rgb = this.hslToRgb(hue, saturation, lightness);
    const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);
    this.updateColor(hex);
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      
      h /= 6;
    }
    
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  isValidHex(hex) {
    return /^#?([a-f\d]{3}|[a-f\d]{6})$/i.test(hex);
  }

  getValue() {
    return this.value;
  }

  setValue(value) {
    if (this.isValidHex(value)) {
      this.updateColor(value);
    }
  }

  destroy() {
    this.picker.remove();
  }
}
```

#### 8.6 图片裁剪器 (ImageCropper)
```javascript
class ImageCropper {
  constructor(options = {}) {
    this.container = options.container;
    this.image = options.image;
    this.aspectRatio = options.aspectRatio;
    this.minWidth = options.minWidth || 100;
    this.minHeight = options.minHeight || 100;
    this.init();
  }

  init() {
    this.createCropper();
    this.loadImage();
    this.bindEvents();
  }

  createCropper() {
    this.cropper = document.createElement('div');
    this.cropper.className = 'image-cropper';
    
    // 图片容器
    this.imageContainer = document.createElement('div');
    this.imageContainer.className = 'image-container';
    
    // 裁剪框
    this.cropBox = document.createElement('div');
    this.cropBox.className = 'crop-box';
    
    // 控制点
    this.controlPoints = document.createElement('div');
    this.controlPoints.className = 'control-points';
    
    ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].forEach(point => {
      const controlPoint = document.createElement('div');
      controlPoint.className = `control-point ${point}`;
      this.controlPoints.appendChild(controlPoint);
    });
    
    this.cropBox.appendChild(this.controlPoints);
    this.imageContainer.appendChild(this.cropBox);
    this.cropper.appendChild(this.imageContainer);
    this.container.appendChild(this.cropper);
  }

  loadImage() {
    const img = new Image();
    img.onload = () => {
      this.imageWidth = img.width;
      this.imageHeight = img.height;
      
      // 计算缩放比例
      const containerWidth = this.imageContainer.clientWidth;
      const containerHeight = this.imageContainer.clientHeight;
      
      const scaleX = containerWidth / this.imageWidth;
      const scaleY = containerHeight / this.imageHeight;
      this.scale = Math.min(scaleX, scaleY);
      
      // 设置图片尺寸
      this.imageElement = img;
      this.imageElement.style.width = `${this.imageWidth * this.scale}px`;
      this.imageElement.style.height = `${this.imageHeight * this.scale}px`;
      
      this.imageContainer.appendChild(this.imageElement);
      
      // 初始化裁剪框
      this.initCropBox();
    };
    
    img.src = this.image;
  }

  initCropBox() {
    const containerWidth = this.imageContainer.clientWidth;
    const containerHeight = this.imageContainer.clientHeight;
    
    // 设置初始裁剪框大小
    let width, height;
    
    if (this.aspectRatio) {
      if (containerWidth / containerHeight > this.aspectRatio) {
        height = containerHeight * 0.8;
        width = height * this.aspectRatio;
      } else {
        width = containerWidth * 0.8;
        height = width / this.aspectRatio;
      }
    } else {
      width = containerWidth * 0.8;
      height = containerHeight * 0.8;
    }
    
    // 设置裁剪框位置
    const left = (containerWidth - width) / 2;
    const top = (containerHeight - height) / 2;
    
    this.cropBox.style.width = `${width}px`;
    this.cropBox.style.height = `${height}px`;
    this.cropBox.style.left = `${left}px`;
    this.cropBox.style.top = `${top}px`;
  }

  bindEvents() {
    let isDragging = false;
    let startX, startY;
    let startWidth, startHeight;
    let startLeft, startTop;
    let currentControlPoint;
    
    // 控制点拖动
    this.controlPoints.addEventListener('mousedown', event => {
      const controlPoint = event.target.closest('.control-point');
      if (!controlPoint) return;
      
      isDragging = true;
      currentControlPoint = controlPoint.className.split(' ')[1];
      
      const rect = this.cropBox.getBoundingClientRect();
      startX = event.clientX;
      startY = event.clientY;
      startWidth = rect.width;
      startHeight = rect.height;
      startLeft = rect.left;
      startTop = rect.top;
      
      event.preventDefault();
    });
    
    // 裁剪框拖动
    this.cropBox.addEventListener('mousedown', event => {
      if (event.target.closest('.control-point')) return;
      
      isDragging = true;
      currentControlPoint = 'move';
      
      const rect = this.cropBox.getBoundingClientRect();
      startX = event.clientX;
      startY = event.clientY;
      startLeft = rect.left;
      startTop = rect.top;
      
      event.preventDefault();
    });
    
    document.addEventListener('mousemove', event => {
      if (!isDragging) return;
      
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      
      const rect = this.cropBox.getBoundingClientRect();
      const containerRect = this.imageContainer.getBoundingClientRect();
      
      switch (currentControlPoint) {
        case 'move':
          let newLeft = startLeft + dx;
          let newTop = startTop + dy;
          
          // 边界检查
          newLeft = Math.max(containerRect.left, 
            Math.min(newLeft, containerRect.right - rect.width));
          newTop = Math.max(containerRect.top, 
            Math.min(newTop, containerRect.bottom - rect.height));
          
          this.cropBox.style.left = `${newLeft - containerRect.left}px`;
          this.cropBox.style.top = `${newTop - containerRect.top}px`;
          break;
          
        case 'nw':
          this.resizeCropBox(startWidth - dx, startHeight - dy, dx, dy);
          break;
          
        case 'n':
          this.resizeCropBox(startWidth, startHeight - dy, 0, dy);
          break;
          
        case 'ne':
          this.resizeCropBox(startWidth + dx, startHeight - dy, 0, dy);
          break;
          
        case 'e':
          this.resizeCropBox(startWidth + dx, startHeight, 0, 0);
          break;
          
        case 'se':
          this.resizeCropBox(startWidth + dx, startHeight + dy, 0, 0);
          break;
          
        case 's':
          this.resizeCropBox(startWidth, startHeight + dy, 0, 0);
          break;
          
        case 'sw':
          this.resizeCropBox(startWidth - dx, startHeight + dy, dx, 0);
          break;
          
        case 'w':
          this.resizeCropBox(startWidth - dx, startHeight, dx, 0);
          break;
      }
    });
    
    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }

  resizeCropBox(width, height, dx, dy) {
    const rect = this.cropBox.getBoundingClientRect();
    const containerRect = this.imageContainer.getBoundingClientRect();
    
    // 保持宽高比
    if (this.aspectRatio) {
      if (Math.abs(dx) > Math.abs(dy)) {
        height = width / this.aspectRatio;
      } else {
        width = height * this.aspectRatio;
      }
    }
    
    // 最小尺寸限制
    width = Math.max(this.minWidth, width);
    height = Math.max(this.minHeight, height);
    
    // 边界检查
    const maxWidth = containerRect.width - (rect.left - containerRect.left);
    const maxHeight = containerRect.height - (rect.top - containerRect.top);
    
    width = Math.min(maxWidth, width);
    height = Math.min(maxHeight, height);
    
    this.cropBox.style.width = `${width}px`;
    this.cropBox.style.height = `${height}px`;
    
    if (dx !== 0) {
      this.cropBox.style.left = `${rect.left - containerRect.left + dx}px`;
    }
    if (dy !== 0) {
      this.cropBox.style.top = `${rect.top - containerRect.top + dy}px`;
    }
  }

  getCroppedImage() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const rect = this.cropBox.getBoundingClientRect();
    const containerRect = this.imageContainer.getBoundingClientRect();
    
    // 计算裁剪区域在原图中的位置和大小
    const x = (rect.left - containerRect.left) / this.scale;
    const y = (rect.top - containerRect.top) / this.scale;
    const width = rect.width / this.scale;
    const height = rect.height / this.scale;
    
    // 设置画布大小
    canvas.width = width;
    canvas.height = height;
    
    // 绘制裁剪后的图片
    ctx.drawImage(
      this.imageElement,
      x, y, width, height,
      0, 0, width, height
    );
    
    return canvas.toDataURL('image/png');
  }

  destroy() {
    this.cropper.remove();
  }
}
```

#### 8.7 树形视图 (TreeView)
```javascript
class TreeView {
  constructor(options = {}) {
    this.container = options.container;
    this.data = options.data || [];
    this.onSelect = options.onSelect;
    this.onExpand = options.onExpand;
    this.init();
  }

  init() {
    this.createTree();
    this.bindEvents();
  }

  createTree() {
    this.tree = document.createElement('div');
    this.tree.className = 'tree-view';
    this.renderNodes(this.data, this.tree);
    this.container.appendChild(this.tree);
  }

  renderNodes(nodes, parentElement) {
    nodes.forEach(node => {
      const nodeElement = document.createElement('div');
      nodeElement.className = 'tree-node';
      nodeElement.dataset.id = node.id;
      
      // 节点内容
      const content = document.createElement('div');
      content.className = 'node-content';
      
      // 展开/折叠按钮
      if (node.children && node.children.length > 0) {
        const toggle = document.createElement('span');
        toggle.className = 'node-toggle';
        toggle.innerHTML = '▶';
        content.appendChild(toggle);
      }
      
      // 节点图标
      const icon = document.createElement('span');
      icon.className = 'node-icon';
      icon.innerHTML = this.getNodeIcon(node);
      content.appendChild(icon);
      
      // 节点文本
      const text = document.createElement('span');
      text.className = 'node-text';
      text.textContent = node.text;
      content.appendChild(text);
      
      nodeElement.appendChild(content);
      
      // 子节点容器
      if (node.children && node.children.length > 0) {
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'node-children';
        childrenContainer.style.display = node.expanded ? 'block' : 'none';
        this.renderNodes(node.children, childrenContainer);
        nodeElement.appendChild(childrenContainer);
      }
      
      parentElement.appendChild(nodeElement);
    });
  }

  getNodeIcon(node) {
    if (node.children && node.children.length > 0) {
      return node.expanded ? '📂' : '📁';
    }
    return '📄';
  }

  bindEvents() {
    this.tree.addEventListener('click', event => {
      const nodeElement = event.target.closest('.tree-node');
      if (!nodeElement) return;
      
      const nodeId = nodeElement.dataset.id;
      const node = this.findNode(this.data, nodeId);
      
      if (!node) return;
      
      // 点击展开/折叠按钮
      const toggle = event.target.closest('.node-toggle');
      if (toggle) {
        const childrenContainer = nodeElement.querySelector('.node-children');
        if (childrenContainer) {
          const isExpanded = childrenContainer.style.display === 'block';
          childrenContainer.style.display = isExpanded ? 'none' : 'block';
          toggle.innerHTML = isExpanded ? '▶' : '▼';
          node.expanded = !isExpanded;
          
          if (this.onExpand) {
            this.onExpand(node, !isExpanded);
          }
        }
        return;
      }
      
      // 点击节点
      if (this.onSelect) {
        this.onSelect(node);
      }
    });
  }

  findNode(nodes, id) {
    for (const node of nodes) {
      if (node.id === id) {
        return node;
      }
      if (node.children) {
        const found = this.findNode(node.children, id);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  expandNode(nodeId) {
    const node = this.findNode(this.data, nodeId);
    if (node) {
      node.expanded = true;
      this.updateTree();
    }
  }

  collapseNode(nodeId) {
    const node = this.findNode(this.data, nodeId);
    if (node) {
      node.expanded = false;
      this.updateTree();
    }
  }

  updateTree() {
    this.tree.innerHTML = '';
    this.renderNodes(this.data, this.tree);
  }

  setData(data) {
    this.data = data;
    this.updateTree();
  }

  destroy() {
    this.tree.remove();
  }
}
```

#### 8.8 文件上传器 (FileUploader)
```javascript
class FileUploader {
  constructor(options = {}) {
    this.container = options.container;
    this.url = options.url;
    this.maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB
    this.allowedTypes = options.allowedTypes || ['*'];
    this.multiple = options.multiple || false;
    this.onProgress = options.onProgress;
    this.onSuccess = options.onSuccess;
    this.onError = options.onError;
    this.init();
  }

  init() {
    this.createUploader();
    this.bindEvents();
  }

  createUploader() {
    this.uploader = document.createElement('div');
    this.uploader.className = 'file-uploader';
    
    // 文件选择区域
    this.dropZone = document.createElement('div');
    this.dropZone.className = 'upload-drop-zone';
    this.dropZone.innerHTML = `
      <div class="upload-icon">📁</div>
      <div class="upload-text">拖拽文件到此处或点击选择文件</div>
      <input type="file" class="file-input" ${this.multiple ? 'multiple' : ''}>
    `;
    
    // 文件列表
    this.fileList = document.createElement('div');
    this.fileList.className = 'upload-file-list';
    
    this.uploader.appendChild(this.dropZone);
    this.uploader.appendChild(this.fileList);
    this.container.appendChild(this.uploader);
  }

  bindEvents() {
    const fileInput = this.dropZone.querySelector('.file-input');
    
    // 点击选择文件
    this.dropZone.addEventListener('click', () => {
      fileInput.click();
    });
    
    // 文件选择
    fileInput.addEventListener('change', event => {
      this.handleFiles(event.target.files);
    });
    
    // 拖拽文件
    this.dropZone.addEventListener('dragover', event => {
      event.preventDefault();
      this.dropZone.classList.add('dragover');
    });
    
    this.dropZone.addEventListener('dragleave', () => {
      this.dropZone.classList.remove('dragover');
    });
    
    this.dropZone.addEventListener('drop', event => {
      event.preventDefault();
      this.dropZone.classList.remove('dragover');
      this.handleFiles(event.dataTransfer.files);
    });
  }

  handleFiles(files) {
    Array.from(files).forEach(file => {
      if (!this.validateFile(file)) {
        return;
      }
      
      this.addFileToList(file);
      this.uploadFile(file);
    });
  }

  validateFile(file) {
    // 检查文件大小
    if (file.size > this.maxSize) {
      this.showError(`文件 ${file.name} 超过大小限制`);
      return false;
    }
    
    // 检查文件类型
    if (this.allowedTypes[0] !== '*' && !this.allowedTypes.includes(file.type)) {
      this.showError(`不支持的文件类型: ${file.type}`);
      return false;
    }
    
    return true;
  }

  addFileToList(file) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.dataset.id = file.name;
    
    fileItem.innerHTML = `
      <div class="file-info">
        <span class="file-icon">${this.getFileIcon(file)}</span>
        <span class="file-name">${file.name}</span>
        <span class="file-size">${this.formatFileSize(file.size)}</span>
      </div>
      <div class="file-progress">
        <div class="progress-bar"></div>
        <span class="progress-text">0%</span>
      </div>
    `;
    
    this.fileList.appendChild(fileItem);
  }

  getFileIcon(file) {
    const type = file.type.split('/')[0];
    const icons = {
      image: '🖼',
      video: '🎥',
      audio: '🎵',
      text: '📄',
      application: '📦'
    };
    return icons[type] || '📁';
  }

  formatFileSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const xhr = new XMLHttpRequest();
    const fileItem = this.fileList.querySelector(`[data-id="${file.name}"]`);
    const progressBar = fileItem.querySelector('.progress-bar');
    const progressText = fileItem.querySelector('.progress-text');
    
    xhr.upload.addEventListener('progress', event => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        progressBar.style.width = `${percent}%`;
        progressText.textContent = `${percent}%`;
        
        if (this.onProgress) {
          this.onProgress(file, percent);
        }
      }
    });
    
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        fileItem.classList.add('success');
        if (this.onSuccess) {
          this.onSuccess(file, xhr.response);
        }
      } else {
        fileItem.classList.add('error');
        if (this.onError) {
          this.onError(file, xhr.statusText);
        }
      }
    });
    
    xhr.addEventListener('error', () => {
      fileItem.classList.add('error');
      if (this.onError) {
        this.onError(file, '上传失败');
      }
    });
    
    xhr.open('POST', this.url);
    xhr.send(formData);
  }

  showError(message) {
    const error = document.createElement('div');
    error.className = 'upload-error';
    error.textContent = message;
    this.uploader.appendChild(error);
    
    setTimeout(() => {
      error.remove();
    }, 3000);
  }

  destroy() {
    this.uploader.remove();
  }
}
```

#### 8.9 进度条 (ProgressBar)
```javascript
class ProgressBar {
  constructor(options = {}) {
    this.container = options.container;
    this.value = options.value || 0;
    this.max = options.max || 100;
    this.min = options.min || 0;
    this.showPercentage = options.showPercentage !== false;
    this.animate = options.animate !== false;
    this.init();
  }

  init() {
    this.createProgressBar();
    this.updateValue(this.value);
  }

  createProgressBar() {
    this.progressBar = document.createElement('div');
    this.progressBar.className = 'progress-bar';
    
    // 进度条背景
    this.track = document.createElement('div');
    this.track.className = 'progress-track';
    
    // 进度条前景
    this.bar = document.createElement('div');
    this.bar.className = 'progress-fill';
    
    // 百分比文本
    this.text = document.createElement('div');
    this.text.className = 'progress-text';
    
    this.track.appendChild(this.bar);
    this.progressBar.appendChild(this.track);
    if (this.showPercentage) {
      this.progressBar.appendChild(this.text);
    }
    this.container.appendChild(this.progressBar);
  }

  updateValue(value) {
    // 确保值在有效范围内
    this.value = Math.max(this.min, Math.min(this.max, value));
    
    // 计算百分比
    const percentage = ((this.value - this.min) / (this.max - this.min)) * 100;
    
    // 更新进度条
    if (this.animate) {
      this.bar.style.transition = 'width 0.3s ease';
    } else {
      this.bar.style.transition = 'none';
    }
    this.bar.style.width = `${percentage}%`;
    
    // 更新文本
    if (this.showPercentage) {
      this.text.textContent = `${Math.round(percentage)}%`;
    }
    
    // 根据进度更新样式
    if (percentage >= 100) {
      this.progressBar.classList.add('complete');
    } else {
      this.progressBar.classList.remove('complete');
    }
  }

  setValue(value) {
    this.updateValue(value);
  }

  increment(value = 1) {
    this.updateValue(this.value + value);
  }

  decrement(value = 1) {
    this.updateValue(this.value - value);
  }

  reset() {
    this.updateValue(this.min);
  }

  destroy() {
    this.progressBar.remove();
  }
}
```

// ... 继续添加更多组件实现 ... 