<template>
  <div class="container">
    <div class="header">
      <h2>四象限任务管理</h2>
      <button @click="openNewTask" class="btn btn-primary">+ 新建任务</button>
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
              [`priority-${task.priority}`]: true
            }"
            draggable="true"
            @dragstart="handleDragStart($event, task)"
            @click="editTask(task)"
          >
            <div class="task-checkbox-small">
              <input
                type="checkbox"
                :checked="task.completed"
                @change.stop="taskStore.toggleComplete(task.id)"
                @click.stop
              />
            </div>
            <div class="task-content">
              <div class="task-title-small">{{ task.title }}</div>
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
  const tasks = taskStore.getTasks();
  return tasks.filter(task => {
    return task.important === quadrant.important && task.urgent === quadrant.urgent;
  });
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  });
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
}

.quadrant {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  min-height: 400px;
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
}

.quadrant-task:hover {
  background: #e9ecef;
  transform: translateX(4px);
}

.quadrant-task.completed {
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
  }
}
</style>
