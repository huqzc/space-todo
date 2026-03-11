<template>
  <div class="container">
    <div class="header">
      <h2>四象限任务管理</h2>
      <div class="header-actions">
        <button
          @click="hideCompleted = !hideCompleted"
          class="btn"
          :class="hideCompleted ? 'btn-primary' : 'btn-outline'"
        >
          {{ hideCompleted ? '✓ 隐藏已完成' : '✓ 显示已完成' }}
        </button>
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
    
    <div class="quadrant-info">
      <p>根据重要性和紧急性将任务分为四个象限。拖拽任务可在象限间移动。</p>
    </div>
    
    <div class="quadrant-grid">
      <div
        v-for="quadrant in quadrants"
        :key="quadrant.id"
        class="quadrant"
        :class="quadrant.class"
        @drop="handleDrop($event, quadrant)"
        @dragover.prevent
        @dragenter.prevent
      >
        <div class="quadrant-header">
          <h3>{{ quadrant.title }}</h3>
          <span class="task-count">{{ getQuadrantTasks(quadrant).length }} 个任务</span>
        </div>
        
        <div class="quadrant-tasks">
          <div
            v-for="task in getQuadrantTasks(quadrant)"
            :key="task.id"
            class="quadrant-task"
            :class="{
              completed: task.completed,
              [`priority-${task.priority}`]: true,
              'other-space': showOverview && task.spaceId !== taskStore.currentSpaceId
            }"
            :draggable="isCurrentSpace(task)"
            @dragstart="handleDragStart($event, task)"
            @click="isCurrentSpace(task) && editTask(task)"
          >
            <div class="task-checkbox-small">
              <input
                type="checkbox"
                :checked="task.completed"
                @change.stop="taskStore.toggleComplete(task.id)"
                @click.stop
                :disabled="showOverview && task.spaceId !== taskStore.currentSpaceId"
              />
            </div>
            <div class="task-content">
              <div class="task-title-small">
                <span v-if="showOverview && task.spaceId !== taskStore.currentSpaceId" class="space-badge">
                  {{ getSpaceName(task.spaceId) }}
                </span>
                {{ task.title }}
              </div>
              <p v-if="task.description" class="task-description-small">
                {{ task.description.substring(0, 50) }}{{ task.description.length > 50 ? '...' : '' }}
              </p>
              <div class="task-meta-small">
                <span v-if="task.dueDate" class="meta-item">
                  📅 {{ formatDate(task.dueDate) }}
                </span>
                <span v-if="task.tags.length > 0" class="meta-item">
                  🏷️ {{ task.tags.join(', ') }}
                </span>
              </div>
            </div>
          </div>
          
          <div v-if="getQuadrantTasks(quadrant).length === 0" class="empty-quadrant">
            <p>暂无任务</p>
            <p class="hint">拖拽任务到这里或创建新任务</p>
          </div>
        </div>
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
const showEditor = ref(false);
const editingTask = ref(null);
const draggedTask = ref(null);
const showOverview = ref(false);
const hideCompleted = ref(false);

const quadrants = [
  {
    id: 'important-urgent',
    title: '重要且紧急',
    class: 'quadrant-1',
    important: true,
    urgent: true
  },
  {
    id: 'important-not-urgent',
    title: '重要不紧急',
    class: 'quadrant-2',
    important: true,
    urgent: false
  },
  {
    id: 'not-important-urgent',
    title: '紧急不重要',
    class: 'quadrant-3',
    important: false,
    urgent: true
  },
  {
    id: 'not-important-not-urgent',
    title: '不紧急不重要',
    class: 'quadrant-4',
    important: false,
    urgent: false
  }
];

const getQuadrantTasks = (quadrant) => {
  const tasks = showOverview.value ? taskStore.getTasks() : taskStore.currentSpaceTasks;
  return tasks.filter(task => {
    if (task.important !== quadrant.important || task.urgent !== quadrant.urgent) return false;
    if (hideCompleted.value && task.completed) return false;
    return true;
  });
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  });
};

const isCurrentSpace = (task) => {
  return task.spaceId === taskStore.currentSpaceId;
};

const getSpaceName = (spaceId) => {
  const space = taskStore.getSpaces().find(s => s.id === spaceId);
  return space ? space.icon + ' ' + space.name : '未知空间';
};

const handleDragStart = (event, task) => {
  draggedTask.value = task;
  event.dataTransfer.effectAllowed = 'move';
  event.target.classList.add('dragging');
};

const handleDrop = async (event, quadrant) => {
  event.preventDefault();
  if (draggedTask.value) {
    await taskStore.updateTask(draggedTask.value.id, {
      important: quadrant.important,
      urgent: quadrant.urgent
    });
    draggedTask.value = null;
  }
  event.target.classList.remove('drag-over');
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

.quadrant-info {
  background: var(--card-bg);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  color: var(--text-secondary);
}

.quadrant-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 20px;
  min-height: 600px;
  max-height: calc(100vh - 280px);
}

.quadrant {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  min-height: 300px;
  max-height: calc((100vh - 320px) / 2);
  overflow: hidden;
}

.quadrant-1 {
  border-top: 4px solid var(--danger-color);
}

.quadrant-2 {
  border-top: 4px solid var(--warning-color);
}

.quadrant-3 {
  border-top: 4px solid var(--primary-color);
}

.quadrant-4 {
  border-top: 4px solid var(--text-secondary);
}

.quadrant-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--border-color);
}

.quadrant-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.task-count {
  font-size: 14px;
  color: var(--text-secondary);
}

.quadrant-tasks {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quadrant-task {
  background: var(--bg-color);
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  border-left: 3px solid var(--border-color);
  flex-shrink: 0;
}

.quadrant-task:hover {
  background: #e9ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.quadrant-task.completed {
  opacity: 0.5;
}

.quadrant-task.other-space {
  opacity: 0.5;
  background: var(--card-bg);
  cursor: default;
}

.quadrant-task.other-space:hover {
  background: var(--card-bg);
  transform: none;
}

.space-badge {
  display: inline-block;
  padding: 2px 6px;
  background: var(--primary-color);
  color: white;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 500;
  margin-right: 6px;
}

.task-checkbox-small input:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.quadrant-task.priority-high {
  border-left-color: var(--danger-color);
}

.quadrant-task.priority-medium {
  border-left-color: var(--warning-color);
}

.quadrant-task.priority-low {
  border-left-color: var(--text-secondary);
}

.task-checkbox-small input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  margin-top: 2px;
}

.task-content {
  flex: 1;
}

.task-title-small {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.task-description-small {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 6px;
  line-height: 1.4;
}

.task-meta-small {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 11px;
  color: var(--text-secondary);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.empty-quadrant {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
}

.empty-quadrant .hint {
  font-size: 12px;
  margin-top: 8px;
  opacity: 0.7;
}

@media (max-width: 1024px) {
  .quadrant-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    max-height: none;
  }

  .quadrant {
    max-height: 400px;
  }
}

@media (max-width: 768px) {
  .quadrant-grid {
    gap: 16px;
  }

  .quadrant {
    max-height: 350px;
    padding: 16px;
  }

  .quadrant-header {
    margin-bottom: 12px;
    padding-bottom: 8px;
  }

  .quadrant-header h3 {
    font-size: 16px;
  }

  .quadrant-tasks {
    gap: 8px;
  }

  .quadrant-task {
    padding: 10px;
    gap: 8px;
  }

  .task-title-small {
    font-size: 14px;
  }

  .task-description-small {
    font-size: 12px;
  }

  .task-meta-small {
    font-size: 10px;
  }
}

@media (max-width: 480px) {
  .quadrant-grid {
    gap: 12px;
  }

  .quadrant {
    max-height: 300px;
    padding: 12px;
  }

  .quadrant-header h3 {
    font-size: 14px;
  }

  .task-count {
    font-size: 12px;
  }

  .quadrant-task {
    padding: 8px;
    gap: 6px;
  }

  .task-checkbox-small input {
    width: 16px;
    height: 16px;
  }

  .task-title-small {
    font-size: 13px;
  }

  .task-description-small {
    font-size: 11px;
  }

  .empty-quadrant {
    padding: 20px 10px;
  }
}
</style>
