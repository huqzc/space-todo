<template>
  <div class="container">
    <div class="header">
      <div class="week-nav">
        <button @click="previousWeek" class="btn btn-outline">← 上一周</button>
        <h2>{{ weekRangeText }}</h2>
        <button @click="nextWeek" class="btn btn-outline">下一周 →</button>
        <button @click="goToToday" class="btn btn-primary">今天</button>
      </div>
      <button @click="openNewTask" class="btn btn-primary">+ 新建任务</button>
    </div>
    
    <div class="week-grid">
      <div
        v-for="day in weekDays"
        :key="day.date"
        class="day-column"
        :class="{ 'today': day.isToday }"
        @drop="handleDrop($event, day.date)"
        @dragover.prevent
        @dragenter.prevent
      >
        <div class="day-header">
          <h3>{{ day.dayName }}</h3>
          <span class="day-date">{{ day.dateText }}</span>
          <span class="task-count">({{ getDayTasks(day.date).length }})</span>
        </div>
        
        <div class="day-tasks">
          <div
            v-for="task in getDayTasks(day.date)"
            :key="task.id"
            class="week-task-item"
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
              />
            </div>
            <div class="task-info">
              <div class="task-title-small">{{ task.title }}</div>
              <div v-if="task.dueDate" class="task-time">
                {{ formatTime(task.dueDate) }}
              </div>
            </div>
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
import { ref, computed, onMounted } from 'vue';
import { useTaskStore } from '@/store/taskStore';
import TaskEditor from '@/components/TaskEditor.vue';

const taskStore = useTaskStore();
const currentWeekStart = ref(new Date());
const showEditor = ref(false);
const editingTask = ref(null);
const draggedTask = ref(null);

const weekDays = computed(() => {
  const days = [];
  const start = new Date(currentWeekStart.value);
  start.setDate(start.getDate() - start.getDay() + 1); // 周一
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    
    const dateStr = date.toISOString().split('T')[0];
    const dateToday = new Date(date);
    dateToday.setHours(0, 0, 0, 0);
    
    days.push({
      date: dateStr,
      dayName: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i],
      dateText: `${date.getMonth() + 1}/${date.getDate()}`,
      isToday: dateToday.getTime() === today.getTime()
    });
  }
  
  return days;
});

const weekRangeText = computed(() => {
  const start = weekDays.value[0].date;
  const end = weekDays.value[6].date;
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  return `${startDate.getMonth() + 1}月${startDate.getDate()}日 - ${endDate.getMonth() + 1}月${endDate.getDate()}日`;
});

const getDayTasks = (date) => {
  const tasks = taskStore.getTasks();
  return tasks
    .filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
      return taskDate === date;
    })
    .sort((a, b) => {
      if (!a.dueDate || !b.dueDate) return 0;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const previousWeek = () => {
  const newDate = new Date(currentWeekStart.value);
  newDate.setDate(newDate.getDate() - 7);
  currentWeekStart.value = newDate;
};

const nextWeek = () => {
  const newDate = new Date(currentWeekStart.value);
  newDate.setDate(newDate.getDate() + 7);
  currentWeekStart.value = newDate;
};

const goToToday = () => {
  currentWeekStart.value = new Date();
};

const handleDragStart = (event, task) => {
  draggedTask.value = task;
  event.dataTransfer.effectAllowed = 'move';
  event.target.classList.add('dragging');
};

const handleDrop = async (event, targetDate) => {
  event.preventDefault();
  if (draggedTask.value) {
    await taskStore.updateTask(draggedTask.value.id, {
      dueDate: targetDate + 'T12:00:00'
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
  flex-wrap: wrap;
  gap: 16px;
}

.week-nav {
  display: flex;
  align-items: center;
  gap: 16px;
}

.week-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 16px;
  min-height: 600px;
}

.day-column {
  background: var(--card-bg);
  border-radius: 8px;
  padding: 12px;
  box-shadow: var(--shadow);
  min-height: 500px;
}

.day-column.today {
  border: 2px solid var(--primary-color);
}

.day-header {
  text-align: center;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--border-color);
  margin-bottom: 12px;
}

.day-header h3 {
  font-size: 16px;
  margin-bottom: 4px;
  color: var(--text-primary);
}

.day-date {
  font-size: 14px;
  color: var(--text-secondary);
  display: block;
}

.task-count {
  font-size: 12px;
  color: var(--text-secondary);
}

.day-tasks {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.week-task-item {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 8px;
}

.week-task-item:hover {
  background: #e9ecef;
  transform: translateX(4px);
}

.week-task-item.completed {
  opacity: 0.5;
}

.week-task-item.priority-high {
  border-left-color: var(--danger-color);
}

.week-task-item.priority-medium {
  border-left-color: var(--warning-color);
}

.week-task-item.priority-low {
  border-left-color: var(--text-secondary);
}

.task-checkbox-small input {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.task-info {
  flex: 1;
}

.task-title-small {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.task-time {
  font-size: 11px;
  color: var(--text-secondary);
}

@media (max-width: 1200px) {
  .week-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .week-grid {
    grid-template-columns: 1fr;
  }
}
</style>
