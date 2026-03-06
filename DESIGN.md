# 待办事项管理系统 - 系统设计文档

## 一、产品功能设计

### 1.1 核心功能

#### 任务管理
- **创建任务**：支持完整的任务信息录入
- **编辑任务**：修改任务的所有属性
- **删除任务**：删除不需要的任务
- **标记完成**：快速切换任务完成状态
- **任务搜索**：按标题和描述搜索
- **标签分类**：使用标签对任务进行分类
- **优先级排序**：按高/中/低优先级排序

#### 任务字段
```javascript
{
  id: string,              // 唯一标识
  title: string,           // 标题（必填）
  description: string,     // 描述
  createdAt: string,       // 创建时间（ISO 格式）
  dueDate: string | null,  // 截止时间（ISO 格式）
  completed: boolean,      // 是否完成
  priority: 'high' | 'medium' | 'low',  // 优先级
  tags: string[],          // 标签数组
  important: boolean,      // 是否重要
  urgent: boolean          // 是否紧急
}
```

### 1.2 时间视图功能

#### 周视图
- 展示当前一周（周一到周日）
- 每天显示对应日期的任务
- 支持拖拽任务修改日期
- 按时间排序显示任务
- 导航：上一周/下一周/今天

#### 月视图
- 日历网格布局
- 每个日期格子显示：
  - 日期数字
  - 任务数量
  - 任务优先级指示点（最多3个）
  - 超出任务数量提示
- 点击日期查看该日所有任务
- 支持新建任务

#### 年视图
- 12个月网格布局
- 每月显示：
  - 月份名称
  - 任务总数
  - 完成率百分比
  - 完成率进度条
- 点击月份进入对应月视图

### 1.3 四象限视图

基于艾森豪威尔四象限任务管理法：

```
┌─────────────────┬─────────────────┐
│  重要且紧急     │  重要不紧急     │
│  (Quadrant 1)   │  (Quadrant 2)   │
├─────────────────┼─────────────────┤
│  紧急不重要     │  不紧急不重要   │
│  (Quadrant 3)   │  (Quadrant 4)   │
└─────────────────┴─────────────────┘
```

- 四个象限分别显示对应任务
- 支持拖拽任务在象限间移动
- 自动更新 important/urgent 字段
- 显示任务数量和详细信息

### 1.4 数据管理功能

#### 数据导出
- 将所有任务导出为 JSON 文件
- 文件名包含日期：`todo-backup-YYYY-MM-DD.json`
- 格式化输出，便于阅读

#### 数据导入
- 从 JSON 文件导入任务
- 数据格式校验
- 防止无效数据导入
- 导入前确认提示

## 二、系统架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────┐
│         Browser (Client)            │
│  ┌───────────────────────────────┐  │
│  │      Vue 3 Application       │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │   Views (Components)    │  │  │
│  │  └─────────────────────────┘  │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │   Pinia Store           │  │  │
│  │  └─────────────────────────┘  │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │   TaskStore (IndexedDB)  │  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
           │
           │ HTTP (Optional)
           │
┌──────────▼──────────────────────────┐
│      Node.js Server (Express)       │
│  ┌───────────────────────────────┐  │
│  │   API Routes                  │  │  │
│  │   Static File Serving         │  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### 2.2 技术选型

#### 前端
- **Vue 3**：使用 Composition API，提供更好的逻辑复用
- **Vue Router**：单页应用路由管理
- **Pinia**：轻量级状态管理
- **Vite**：快速的前端构建工具

#### 后端
- **Node.js**：JavaScript 运行时
- **Express**：Web 框架
- **CORS**：跨域支持

#### 数据存储
- **IndexedDB**：浏览器本地数据库，支持大量数据存储

### 2.3 数据流

```
User Action
    ↓
Component (View)
    ↓
Pinia Store (useTaskStore)
    ↓
TaskStore (IndexedDB Wrapper)
    ↓
IndexedDB
```

## 三、数据结构设计

### 3.1 任务数据模型

```typescript
interface Task {
  id: string;                    // 唯一标识，使用时间戳生成
  title: string;                 // 任务标题，必填
  description: string;           // 任务描述，可选
  createdAt: string;            // 创建时间，ISO 8601 格式
  dueDate: string | null;        // 截止时间，ISO 8601 格式，可选
  completed: boolean;            // 完成状态
  priority: 'high' | 'medium' | 'low';  // 优先级
  tags: string[];               // 标签数组
  important: boolean;            // 是否重要（四象限用）
  urgent: boolean;              // 是否紧急（四象限用）
}
```

### 3.2 IndexedDB 设计

**数据库名称**：`TodoDB`

**对象存储**：`tasks`
- 主键：`id`
- 索引：
  - `createdAt`：创建时间索引
  - `dueDate`：截止时间索引
  - `completed`：完成状态索引

### 3.3 导出数据格式

```json
[
  {
    "id": "1234567890",
    "title": "示例任务",
    "description": "任务描述",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "dueDate": "2024-01-15T12:00:00.000Z",
    "completed": false,
    "priority": "high",
    "tags": ["工作", "重要"],
    "important": true,
    "urgent": true
  }
]
```

## 四、API 设计

### 4.1 后端 API（当前版本主要用于健康检查）

由于使用浏览器本地存储，大部分数据操作在前端完成。

#### GET /api/health
健康检查接口

**响应**：
```json
{
  "status": "ok",
  "message": "Todo API Server is running"
}
```

### 4.2 前端数据接口（TaskStore）

#### getTasks(): Promise<Task[]>
获取所有任务

#### addTask(task: Task): Promise<void>
添加新任务

#### updateTask(task: Task): Promise<void>
更新任务

#### deleteTask(id: string): Promise<void>
删除任务

#### importTasks(tasks: Task[]): Promise<void>
批量导入任务

## 五、前端页面结构

### 5.1 页面路由

| 路径 | 组件 | 说明 |
|------|------|------|
| `/` | TaskListView | 任务列表页 |
| `/week` | WeekView | 周视图 |
| `/month` | MonthView | 月视图 |
| `/year` | YearView | 年视图 |
| `/quadrant` | QuadrantView | 四象限视图 |

### 5.2 组件层次结构

```
App.vue
├── Navbar (导航栏)
│   ├── 导航链接
│   └── 导入/导出按钮
└── RouterView
    ├── TaskListView
    │   ├── 搜索和过滤栏
    │   ├── 任务列表
    │   └── TaskEditor (模态框)
    ├── WeekView
    │   ├── 周导航
    │   ├── 7天任务列
    │   └── TaskEditor
    ├── MonthView
    │   ├── 月导航
    │   ├── 日历网格
    │   ├── 选中日期任务列表
    │   └── TaskEditor
    ├── YearView
    │   ├── 年导航
    │   └── 12个月卡片
    └── QuadrantView
        ├── 四象限说明
        ├── 四个象限区域
        └── TaskEditor
```

### 5.3 组件说明

#### App.vue
- 应用根组件
- 包含导航栏和路由视图
- 处理数据导入导出

#### TaskEditor.vue
- 任务编辑/创建组件
- 模态框形式
- 支持所有任务字段编辑

#### TaskListView.vue
- 任务列表视图
- 搜索、过滤、排序功能
- 任务卡片展示

#### WeekView.vue
- 周视图
- 7列布局（周一到周日）
- 支持拖拽修改日期

#### MonthView.vue
- 月视图
- 日历网格布局
- 点击日期查看任务

#### YearView.vue
- 年视图
- 12个月卡片
- 显示统计信息

#### QuadrantView.vue
- 四象限视图
- 2x2 网格布局
- 支持拖拽移动任务

## 六、关键代码示例

### 6.1 数据存储封装（TaskStore）

```javascript
// client/src/utils/taskStore.js
export class TaskStore {
  constructor() {
    this.dbName = 'TodoDB';
    this.storeName = 'tasks';
    this.version = 1;
  }
  
  async init() {
    // 初始化 IndexedDB 连接
  }
  
  async getTasks() {
    // 获取所有任务
  }
  
  async addTask(task) {
    // 添加任务
  }
  
  async updateTask(task) {
    // 更新任务
  }
  
  async deleteTask(id) {
    // 删除任务
  }
  
  async importTasks(tasks) {
    // 批量导入任务
  }
}
```

### 6.2 Pinia Store

```javascript
// client/src/store/taskStore.js
export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref([]);
  const taskStore = new TaskStore();
  
  const addTask = async (taskData) => {
    // 创建新任务并保存
  };
  
  const updateTask = async (id, updates) => {
    // 更新任务
  };
  
  const deleteTask = async (id) => {
    // 删除任务
  };
  
  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    // ...
  };
});
```

### 6.3 拖拽功能实现

```javascript
// 周视图拖拽示例
const handleDragStart = (event, task) => {
  draggedTask.value = task;
  event.dataTransfer.effectAllowed = 'move';
};

const handleDrop = async (event, targetDate) => {
  event.preventDefault();
  if (draggedTask.value) {
    await taskStore.updateTask(draggedTask.value.id, {
      dueDate: targetDate + 'T12:00:00'
    });
  }
};
```

## 七、项目目录结构

```
cursor-todo/
├── server/                      # 后端服务
│   └── index.js                # Express 服务器入口
├── client/                      # 前端应用
│   ├── index.html              # HTML 入口文件
│   └── src/
│       ├── main.js             # Vue 应用入口
│       ├── App.vue             # 根组件
│       ├── style.css           # 全局样式
│       ├── components/         # 可复用组件
│       │   └── TaskEditor.vue # 任务编辑器
│       ├── views/              # 页面视图
│       │   ├── TaskListView.vue
│       │   ├── WeekView.vue
│       │   ├── MonthView.vue
│       │   ├── YearView.vue
│       │   └── QuadrantView.vue
│       ├── store/              # Pinia 状态管理
│       │   └── taskStore.js
│       ├── utils/              # 工具函数
│       │   └── taskStore.js    # IndexedDB 封装
│       └── router/             # 路由配置
│           └── index.js
├── package.json                # 项目配置
├── vite.config.js             # Vite 配置
├── .gitignore                 # Git 忽略文件
├── README.md                  # 项目说明
└── DESIGN.md                  # 设计文档（本文件）
```

## 八、用户体验增强建议

### 8.1 任务提醒
- **浏览器通知**：基于截止时间发送通知
- **邮件提醒**：重要任务邮件提醒
- **提醒设置**：可配置提醒时间（提前1天、3天等）

### 8.2 番茄钟
- **计时功能**：为任务设置番茄钟
- **统计记录**：记录每个任务的专注时间
- **休息提醒**：25分钟工作后提醒休息

### 8.3 统计分析
- **完成趋势**：折线图显示任务完成趋势
- **时间分布**：饼图显示任务时间分布
- **标签统计**：各标签使用频率
- **效率分析**：任务完成效率分析

### 8.4 快捷键操作
- `Ctrl/Cmd + N`：新建任务
- `Ctrl/Cmd + F`：聚焦搜索框
- `Esc`：关闭模态框
- `Ctrl/Cmd + S`：保存任务（在编辑器中）
- `Delete`：删除选中任务

### 8.5 其他增强功能
- **任务模板**：保存常用任务模板
- **批量操作**：批量删除、批量标记完成
- **任务依赖**：设置任务之间的依赖关系
- **子任务**：支持任务分解为子任务
- **附件支持**：为任务添加附件
- **评论功能**：为任务添加评论和备注
- **主题切换**：深色模式、自定义主题
- **多语言支持**：国际化支持

## 九、开发规范

### 9.1 代码风格
- 使用 ES6+ 语法
- 组件使用 Composition API
- 使用 `<script setup>` 语法
- 遵循 Vue 3 最佳实践

### 9.2 命名规范
- 组件：PascalCase（如 `TaskEditor.vue`）
- 变量/函数：camelCase（如 `taskStore`）
- 常量：UPPER_SNAKE_CASE（如 `MAX_TASKS`）
- CSS 类：kebab-case（如 `task-item`）

### 9.3 文件组织
- 按功能模块组织文件
- 组件放在 `components/` 目录
- 页面视图放在 `views/` 目录
- 工具函数放在 `utils/` 目录

## 十、部署说明

### 10.1 开发环境
```bash
npm install
npm run dev
```

### 10.2 生产构建
```bash
npm run build
```

构建产物在 `dist/` 目录，可部署到任何静态文件服务器。

### 10.3 服务器配置
Express 服务器已配置静态文件服务，可直接使用：
```bash
npm run server
```

访问 `http://localhost:3000` 查看应用。
