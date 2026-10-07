/* Shared navigation: this file runs on every page, so check elements before using them. */
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('nav');
if (menuButton && navigation) {
  menuButton.addEventListener('click', function () {
    const isOpen = navigation.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      navigation.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    }
  });
}
document.querySelectorAll('.year').forEach(function (year) {
  year.textContent = new Date().getFullYear();
});

/* Academic planner: tasks are deliberately stored only in an array, not a database. */
let tasks = [];
let nextTaskId = 1;
let currentFilter = 'all';
const taskForm = document.querySelector('#task-form');
const taskList = document.querySelector('#task-list');
const taskInput = document.querySelector('#task-input');
const categoryInput = document.querySelector('#task-category');
function addTask(event) {
  event.preventDefault();
  const title = taskInput.value.trim();
  if (!title) {
    taskInput.setCustomValidity('Please enter a task, not just spaces.');
    taskInput.reportValidity();
    return;
  }
  tasks.push({ id: nextTaskId++, title: title, category: categoryInput.value, completed: false });
  taskInput.value = '';
  currentFilter = 'all';
  updateFilters();
  displayTasks();
  taskInput.focus();
}
function completeTask(id) {
  const task = tasks.find(function (item) { return item.id === id; });
  if (task) task.completed = !task.completed;
  displayTasks();
}
function deleteTask(id) {
  tasks = tasks.filter(function (task) { return task.id !== id; });
  displayTasks();
}
function updateTaskStatistics() {
  const total = tasks.length;
  const completed = tasks.filter(function (task) { return task.completed; }).length;
  const percent = total ? Math.round(completed / total * 100) : 0;
  document.querySelector('#total-tasks').textContent = total;
  document.querySelector('#completed-tasks').textContent = completed;
  document.querySelector('#completion-percent').textContent = percent + '%';
  document.querySelector('#task-progress').value = percent;
  document.querySelector('#task-count').textContent = total + (total === 1 ? ' task' : ' tasks');
}
function displayTasks() {
  taskList.replaceChildren();
  const visibleTasks = tasks.filter(function (task) {
    if (currentFilter === 'active') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true;
  });
  visibleTasks.forEach(function (task) {
    const item = document.createElement('li');
    item.className = 'task-item' + (task.completed ? ' completed' : '');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', 'Mark ' + task.title + ' as ' + (task.completed ? 'incomplete' : 'completed'));
    checkbox.addEventListener('change', function () { completeTask(task.id); });
    const content = document.createElement('div');
    content.className = 'task-content';
    const title = document.createElement('span');
    title.className = 'task-title';
    // textContent keeps anything typed by a visitor safe: it is never interpreted as HTML.
    title.textContent = task.title;
    const category = document.createElement('span');
    category.className = 'task-category';
    category.textContent = task.category;
    content.append(title, category);
    const remove = document.createElement('button');
    remove.className = 'delete-task';
    remove.type = 'button';
    remove.title = 'Delete task';
    remove.setAttribute('aria-label', 'Delete ' + task.title);
    remove.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/></svg>';
    remove.addEventListener('click', function () { deleteTask(task.id); });
    item.append(checkbox, content, remove);
    taskList.append(item);
  });
  const empty = document.querySelector('#empty-tasks');
  empty.hidden = visibleTasks.length > 0;
  empty.querySelector('h3').textContent = tasks.length ? 'All clear here.' : 'A fresh start.';
  empty.querySelector('p').textContent = tasks.length ? 'No tasks in this view. Check another tab or add something new.' : 'Your list is clear. Add your first task and take a small step forward.';
  updateTaskStatistics();
}
function updateFilters() {
  document.querySelectorAll('[data-filter]').forEach(function (button) {
    const selected = button.dataset.filter === currentFilter;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}
if (taskForm) {
  taskForm.addEventListener('submit', addTask);
  taskInput.addEventListener('input', function () { taskInput.setCustomValidity(''); });
  document.querySelectorAll('[data-filter]').forEach(function (button) {
    button.addEventListener('click', function () {
      currentFilter = button.dataset.filter;
      updateFilters();
      displayTasks();
    });
  });
  const studyTips = [
    'Try 25 minutes of focused study, then take a 5-minute break. Small sessions add up.',
    'Close your notes and explain what you learned in your own words. Teaching is a powerful way to remember.',
    'Start with one small, specific task. Momentum is easier to build than perfection.',
    'Review a little each day instead of leaving everything for the night before an exam.',
    'Keep a glass of water nearby and give your eyes a break from the screen.'
  ];
  document.querySelector('#study-tip').textContent = studyTips[new Date().getDate() % studyTips.length];
  displayTasks();
}

/* Contact form: validates locally and never sends personal data to a server. */
const contactForm = document.querySelector('#contact-form');
function validateContactField(id) {
  const input = document.getElementById(id);
  const value = input.value.trim();
  let error = '';
  if (!value) error = 'Please fill in this field.';
  else if (id === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Please enter a valid email address.';
  else if (id === 'phone' && !/^\d+$/.test(value)) error = 'Use digits only, without spaces or symbols.';
  else if (id === 'message' && value.length < 10) error = 'Please write at least 10 characters.';
  document.getElementById(id + '-error').textContent = error;
  input.setAttribute('aria-invalid', String(Boolean(error)));
  return !error;
}
if (contactForm) {
  const fieldIds = ['full-name', 'email', 'phone', 'message'];
  fieldIds.forEach(function (id) {
    document.getElementById(id).addEventListener('input', function () {
      document.querySelector('#form-success').hidden = true;
      if (this.getAttribute('aria-invalid') === 'true') validateContactField(id);
    });
  });
  contactForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const results = fieldIds.map(validateContactField);
    const valid = results.every(function (result) { return result; });
    document.querySelector('#form-success').hidden = !valid;
    if (!valid) document.getElementById(fieldIds[results.indexOf(false)]).focus();
  });
}

/* Working project previews: lightweight examples, built without libraries. */
const projectDetail = document.querySelector('#project-detail');
if (projectDetail) {
  const project = new URLSearchParams(window.location.search).get('project');
  const demos = [
    '<div class="eyebrow">MATIVABUDDY · MINI DEMO</div><h2>A little help for your next study session.</h2><p>Choose a topic to explore a few quick study notes.</p><div class="demo-resources"><details class="demo-item"><summary>HTML foundations</summary><ul><li>Use semantic tags to give your page meaning.</li><li>Label every form field.</li><li>Give images descriptive alternative text.</li></ul></details><details class="demo-item"><summary>CSS essentials</summary><ul><li>Use Flexbox for rows and Grid for layouts.</li><li>Keep colors in reusable variables.</li><li>Test your page on small screens.</li></ul></details><details class="demo-item"><summary>JavaScript basics</summary><ul><li>Store related items in an array.</li><li>Use functions to organize repeated actions.</li><li>Listen for events to make pages interactive.</li></ul></details></div>',
    '<div class="eyebrow">CAMPUS FOOD GUIDE · MINI DEMO</div><h2>A good meal without the big spend.</h2><p>Illustrative campus food options — names and prices are sample content, not real businesses.</p><div class="demo-resources"><article class="demo-item"><h3>Campus Kitchen</h3><p>Rice & vegetables<br>Sample price: ₦1,500<br>Near the main gate</p></article><article class="demo-item"><h3>The Green Bowl</h3><p>Beans & plantain<br>Sample price: ₦1,200<br>Beside the student centre</p></article><article class="demo-item"><h3>Lunch Corner</h3><p>Sandwich & fruit<br>Sample price: ₦1,000<br>Near the library</p></article></div>',
    '<div class="eyebrow">STUDENT RESULT CALCULATOR · MINI DEMO</div><h2>Your results, a little clearer.</h2><p>Enter scores between 0 and 100, separated by commas. Sample grading: A ≥ 70, B ≥ 60, C ≥ 50, D ≥ 45, E ≥ 40, F below 40.</p><form id="calculator-form"><div class="field"><label for="scores">Your scores</label><input id="scores" placeholder="85, 78, 92" required aria-describedby="calculator-result"></div><button class="button primary" type="submit">Calculate average ↗</button><p id="calculator-result" role="status"></p></form>'
  ];
  if (project !== null && ['0', '1', '2'].includes(project)) {
    projectDetail.hidden = false;
    projectDetail.innerHTML = demos[Number(project)];
    const calculator = document.querySelector('#calculator-form');
    if (calculator) calculator.addEventListener('submit', function (event) {
      event.preventDefault();
      const pieces = document.querySelector('#scores').value.split(',').map(function (part) { return part.trim(); });
      const scores = pieces.map(Number);
      const output = document.querySelector('#calculator-result');
      if (pieces.some(function (piece) { return !piece; }) || scores.some(function (score) { return !Number.isFinite(score) || score < 0 || score > 100; })) {
        output.textContent = 'Please use numbers from 0 to 100, separated by commas.';
        return;
      }
      const average = scores.reduce(function (sum, score) { return sum + score; }, 0) / scores.length;
      const grade = average >= 70 ? 'A' : average >= 60 ? 'B' : average >= 50 ? 'C' : average >= 45 ? 'D' : average >= 40 ? 'E' : 'F';
      output.textContent = 'Average: ' + average.toFixed(1) + '% · Grade: ' + grade + ' · ' + scores.length + ' score(s)';
    });
    projectDetail.scrollIntoView({ block: 'start' });
  }
}
