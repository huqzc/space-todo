<template>
  <div class="container">
    <div class="header">
      <h2>任务列表</h2>
      <div class="header-actions">
        <button 
          @click="showOverview = !showOverview" 
          class="btn"
          :class="showOverview ? 'btn-primary' : 'btn-outline'"
        >
          {{ showOverview ? '📊 总览模式' : '📋 当前空间' }}
        </button>
        <button @click="openNewTask" class="btn btn-primary">+ 新建任务</button>
      </div>
    </div>

    <div class="filters">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索任务..."
        class="input"
        style="max-width: 300px;"
      />
      <select v-model="filterPriority" class="select" style="max-width: 150px;">
        <option value="">所有优先级</option>
        <option value="high">高优先级</option>
        <option value="medium">中优先级</option>
        <option value="low">低优先级</option>
      </select>
      <select v-model="filterTag" class="select" style="max-width: 150px;">
        <option value="">所有标签</option>
        <option v-for="tag in allTags" :key="tag" :value="tag">{{ tag }}</option>
      </select>
      <select v-model="sortBy" class="select" style="max-width: 150px;">
        <option value="createdAt">创建时间</option>
        <option value="dueDate">截止时间</option>
        <option value="priority">优先级</option>
      </select>
    </div>
    
    <div class="task-list">
      <div
        v-for="task in filteredTasks"
        :key="task.id"
        class="task-item"
        :class="{ 
          completed: task.completed,
          'other-space': showOverview && task.spaceId !== taskStore.currentSpaceId
        }"
      >
        <div class="task-checkbox">
          <input
            type="checkbox"
            :checked="task.completed"
            @change="taskStore.toggleComplete(task.id)"
            :disabled="showOverview && task.spaceId !== taskStore.currentSpaceId"
          />
        </div>
        <div class="task-content" @click="isCurrentSpace(task) && editTask(task)">
          <div class="task-header">
            <h3 class="task-title">
              <span v-if="showOverview && task.spaceId !== taskStore.currentSpaceId" class="space-badge">
                {{ getSpaceName(task.spaceId) }}
              </span>
              {{ task.title }}
            </h3>
            <span
              class="priority-badge"
              :class="`priority-${task.priority}`"
            >
              {{ getPriorityText(task.priority) }}
            </span>
          </div>
          <p v-if="task.description" class="task-description">{{ task.description }}</p>
          <div class="task-meta">
            <span v-if="task.dueDate" class="meta-item">
              📅 {{ formatDate(task.dueDate) }}
            </span>
            <span class="meta-item">
              🏷️ {{ task.tags.join(', ') || '无标签' }}
            </span>
            <span v-if="task.important" class="meta-item important">⭐ 重要</span>
            <span v-if="task.urgent" class="meta-item urgent">⚡ 紧急</span>
          </div>
        </div>
        <div class="task-actions" v-if="isCurrentSpace(task)">
          <button @click="editTask(task)" class="btn btn-outline" style="padding: 6px 12px;">编辑</button>
          <button @click="deleteTask(task.id)" class="btn btn-danger" style="padding: 6px 12px;">删除</button>
        </div>
      </div>

      <div v-if="filteredTasks.length === 0" class="empty-state">
        <p>暂无任务</p>
      </div>
    </div>
    
    <TaskEditor
      v-if="showEditor"
      :task="editingTask"
      @close="closeEditor"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useTaskStore } from '@/store/taskStore';
import TaskEditor from '@/components/TaskEditor.vue';

const taskStore = useTaskStore();
const searchQuery = ref('');
const filterPriority = ref('');
const filterTag = ref('');
const sortBy = ref('createdAt');
const showEditor = ref(false);
const editingTask = ref(null);
const showOverview = ref(false);

const allTags = computed(() => {
  const tags = new Set();
  taskStore.getTasks().forEach(task => {
    task.tags?.forEach(tag => tags.add(tag));
  });
  return Array.from(tags);
});

const filteredTasks = computed(() => {
  // 根据总览模式选择任务源
  let tasks = showOverview.value ? taskStore.getTasks() : taskStore.currentSpaceTasks;

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    tasks = tasks.filter(task =>
      task.title.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query)
    );
  }

  // 优先级过滤
  if (filterPriority.value) {
    tasks = tasks.filter(task => task.priority === filterPriority.value);
  }

  // 标签过滤
  if (filterTag.value) {
    tasks = tasks.filter(task => task.tags?.includes(filterTag.value));
  }

  // 排序
  tasks = [...tasks].sort((a, b) => {
    if (sortBy.value === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    } else if (sortBy.value === 'dueDate') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    } else {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  return tasks;
});

const isCurrentSpace = (task) => {
  return task.spaceId === taskStore.currentSpaceId;
};

const getSpaceName = (spaceId) => {
  const space = taskStore.getSpaces().find(s => s.id === spaceId);
  return space ? space.icon + ' ' + space.name : '未知空间';
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getPriorityText = (priority) => {
  const map = { high: '高', medium: '中', low: '低' };
  return map[priority] || priority;
};

const openNewTask = () => {
  editingTask.value = null;
  showEditor.value = true;
};

const editTask = (task) => {
  editingTask.value = task;
  showEditor.value = true;
};

const closeEditor = () => {
  showEditor.value = false;
  editingTask.value = null;
};

const handleSave = async (taskData) => {
  if (editingTask.value) {
    await taskStore.updateTask(editingTask.value.id, taskData);
  } else {
    await taskStore.addTask(taskData);
  }
  closeEditor();
};

const deleteTask = async (id) => {
  if (confirm('确定要删除这个任务吗？')) {
    await taskStore.deleteTask(id);
  }
};
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  background: var(--card-bg);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  box-shadow: var(--shadow);
  transition: all 0.3s ease;
}

.task-item:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-2px);
}

.task-item.completed {
  opacity: 0.6;
}

.task-item.completed .task-title {
  text-decoration: line-through;
}

/* 其他空间的任务样式 */
.task-item.other-space {
  opacity: 0.5;
  background: var(--bg-color);
  pointer-events: none;
}

.task-item.other-space .task-content {
  cursor: default;
}

.task-item.other-space:hover {
  transform: none;
  box-shadow: var(--shadow);
}

.space-badge {
  display: inline-block;
  padding: 2px 8px;
  background: var(--primary-color);
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  margin-right: 8px;
}

.task-checkbox {
  margin-top: 4px;
}

.task-checkbox input {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.task-checkbox input:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.task-content {
  flex: 1;
  cursor: pointer;
}

.task-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.task-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.task-description {
  color: var(--text-secondary);
  margin-bottom: 8px;
  line-height: 1.5;
}

.task-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--text-secondary);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-item.important {
  color: var(--warning-color);
  font-weight: 500;
}

.meta-item.urgent {
  color: var(--danger-color);
  font-weight: 500;
}

.priority-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.task-actions {
  display: flex;
  gap: 8px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}
</style>
