# 待办事项管理系统 (Todo System)

一个功能完整的待办事项管理系统，使用 Vue3 + Node.js 构建，支持多种视图和任务管理功能。

## 📋 功能特性

### 核心功能
- ✅ **空间管理**：支持创建多个空间（如工作、学习、生活），任务自动归属到当前空间
- ✅ **任务总览**：一键查看所有空间的任务，以浅透明度、只读形式展示
- ✅ 任务的创建、编辑、删除
- ✅ 任务完成状态切换
- ✅ 任务搜索和过滤
- ✅ 标签分类管理
- ✅ 优先级排序（高/中/低）
- ✅ 重要/紧急标记

### 空间功能
- 🏢 **多空间支持**：创建和管理多个独立的任务空间
- 🎨 **自定义空间**：为每个空间设置名称、图标和颜色
- 🔄 **快速切换**：在不同空间之间快速切换
- 📊 **任务总览**：跨空间查看所有任务的统计和详情

### 时间视图
- 📅 **周视图**：展示一周的任务，支持拖拽修改日期
- 📆 **月视图**：日历形式展示，点击日期查看任务
- 📊 **年视图**：12个月概览，显示任务数量和完成率

### 四象限视图
- 🎯 艾森豪威尔四象限任务管理法
- 支持拖拽任务在象限间移动
- 自动更新重要/紧急字段

### 数据管理
- 💾 使用 IndexedDB 本地存储
- 📤 数据导出为 JSON 文件（包含空间和任务）
- 📥 数据导入（支持数据校验，兼容新旧格式）

## 🛠️ 技术栈

### 前端
- Vue 3 (Composition API)
- Vue Router
- Pinia (状态管理)
- Vite (构建工具)

### 数据存储
- IndexedDB (浏览器本地数据库)

## 📁 项目结构

```
space-todo/
├── index.html            # HTML 入口
└── src/
    ├── main.js           # Vue 应用入口
    ├── App.vue           # 根组件
    ├── style.css         # 全局样式
    ├── components/
    │   └── TaskEditor.vue    # 任务编辑器组件
    ├── views/
    │   ├── TaskListView.vue  # 任务列表视图
    │   ├── WeekView.vue      # 周视图
    │   ├── MonthView.vue     # 月视图
    │   ├── YearView.vue      # 年视图
    │   └── QuadrantView.vue  # 四象限视图
    ├── store/
    │   └── taskStore.js      # Pinia 状态管理
    ├── utils/
    │   └── taskStore.js      # IndexedDB 数据存储封装
    └── router/
        └── index.js          # 路由配置
```

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 📖 使用说明

### 空间管理

#### 创建和管理空间
1. 点击导航栏的空间选择器
2. 点击"新建空间"按钮
3. 设置空间名称、图标和颜色
4. 保存后即可在空间列表中看到新空间

#### 切换空间
- 点击导航栏的空间选择器
- 从下拉列表中选择要切换的空间
- 当前空间会以高亮显示

#### 编辑和删除空间
- 在空间下拉列表中，鼠标悬停在空间上
- 点击编辑图标可修改空间信息
- 点击删除图标可删除空间（至少保留一个空间）

### 任务总览

点击导航栏的"📊 任务总览"按钮，可以：
- 查看所有空间的任务统计（总任务数、未完成、已完成、完成率）
- 以分组形式查看各个空间的任务列表
- 任务以浅透明度、只读形式展示，便于快速浏览

### 任务字段说明

- **id**: 任务唯一标识
- **title**: 任务标题（必填）
- **description**: 任务描述
- **createdAt**: 创建时间（自动生成）
- **dueDate**: 截止时间
- **completed**: 是否完成
- **priority**: 优先级（high/medium/low）
- **tags**: 标签数组
- **important**: 是否重要
- **urgent**: 是否紧急
- **spaceId**: 所属空间ID（自动关联到当前空间）

### 视图切换

通过顶部导航栏可以切换不同的视图：
- **任务列表**：查看所有任务，支持搜索和过滤
- **周视图**：按周查看任务，支持拖拽修改日期
- **月视图**：日历形式，点击日期查看任务
- **年视图**：年度概览，点击月份进入月视图
- **四象限**：按重要性和紧急性分类

### 数据导入导出

- **导出**：点击导航栏的"导出数据"按钮，下载 JSON 文件（包含所有空间和任务数据）
- **导入**：点击"导入数据"按钮，选择 JSON 文件导入
  - 支持新格式（包含 spaces 和 tasks）
  - 兼容旧格式（仅包含 tasks 数组）
  - 导入前会进行数据校验

## 🎨 用户体验增强建议

以下功能可以作为未来扩展：

1. **任务提醒**
   - 基于截止时间的浏览器通知
   - 邮件提醒

2. **番茄钟**
   - 集成番茄工作法
   - 任务计时功能

3. **统计分析**
   - 任务完成趋势图
   - 时间分布统计
   - 标签使用频率

4. **快捷键操作**
   - `Ctrl+N`: 新建任务
   - `Ctrl+F`: 搜索
   - `Esc`: 关闭弹窗

5. **主题切换**
   - 深色模式
   - 自定义主题色

6. **任务模板**
   - 保存常用任务模板
   - 快速创建相似任务

## 🔧 开发说明

### 数据存储

系统使用 IndexedDB 存储数据，封装在 `TaskStore` 类中：

```javascript
// 获取所有任务
const tasks = await taskStore.getTasks();

// 添加任务
await taskStore.addTask(task);

// 更新任务
await taskStore.updateTask(task);

// 删除任务
await taskStore.deleteTask(id);
```

### 状态管理

使用 Pinia 进行状态管理，store 定义在 `client/src/store/taskStore.js`：

```javascript
import { useTaskStore } from '@/store/taskStore';

const taskStore = useTaskStore();
const tasks = taskStore.getTasks();
```

### 路由配置

路由定义在 `client/src/router/index.js`，支持以下路由：
- `/` - 任务列表
- `/week` - 周视图
- `/month` - 月视图
- `/year` - 年视图
- `/quadrant` - 四象限视图

## 📝 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
