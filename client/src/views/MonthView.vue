<template>
  <div class="container">
    <div class="header">
      <div class="month-nav">
        <button @click="previousMonth" class="btn btn-outline">← 上个月</button>
        <h2>{{ currentMonthText }}</h2>
        <button @click="nextMonth" class="btn btn-outline">下个月 →</button>
        <button @click="goToToday" class="btn btn-primary">今天</button>
      </div>
      <button @click="openNewTask" class="btn btn-primary">+ 新建任务</button>
    </div>
    
    <div class="calendar">
      <div class="calendar-header">
        <div v-for="day in weekDays" :key="day" class="calendar-day-header">
          {{ day }}
        </div>
      </div>
      
      <div class="calendar-grid">
        <div
          v-for="day in calendarDays"
          :key="day.date"
          class="calendar-day"
          :class="{
            'other-month': day.isOtherMonth,
            'today': day.isToday,
            'has-tasks': getDayTasks(day.date).length > 0
          }"
          @click="selectDay(day.date)"
        >
          <div class="day-number">{{ day.day }}</div>
          <div class="day-tasks-preview">
            <div
              v-for="(task, index) in getDayTasks(day.date).slice(0, 3)"
              :key="task.id"
              class="task-dot"
              :class="`priority-${task.priority}`"
              :title="task.title"
            />
            <span
              v-if="getDayTasks(day.date).length > 3"
              class="task-more"
            >
              +{{ getDayTasks(day.date).length - 3 }}
            </span>
          </div>
          <div class="task-count-badge">
            {{ getDayTasks(day.date).length }}
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="selectedDay" class="selected-day-tasks">
      <h3>{{ formatSelectedDay(selectedDay) }} 的任务</h3>
      <div class="task-list">
        <div
          v-for="task in getDayTasks(selectedDay)"
          :key="task.id"
          class="task-item"
          :class="{ completed: task.completed }"
        >
          <div class="task-checkbox">
            <input
              type="checkbox"
              :checked="task.completed"
              @change="taskStore.toggleComplete(task.id)"
            />
          </div>
          <div class="task-content" @click="editTask(task)">
            <div class="task-header">
              <h4 class="task-title">{{ task.title }}</h4>
              <span
                class="priority-badge"
                :class="`priority-${task.priority}`"
              >
                {{ getPriorityText(task.priority) }}
              </span>
            </div>
            <p v-if="task.description" class="task-description">{{ task.description }}</p>
          </div>
          <button @click="editTask(task)" class="btn btn-outline" style="padding: 6px 12px;">编辑</button>
        </div>
        <div v-if="getDayTasks(selectedDay).length === 0" class="empty-state">
          <p>这一天没有任务</p>
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
import { useRoute } from 'vue-router';
import { useTaskStore } from '@/store/taskStore';
import TaskEditor from '@/components/TaskEditor.vue';

const route = useRoute();
const taskStore = useTaskStore();
const currentDate = ref(new Date());
const selectedDay = ref(null);
const showEditor = ref(false);
const editingTask = ref(null);

onMounted(() => {
  // 支持从年视图跳转过来时显示指定月份
  if (route.query.year && route.query.month) {
    const year = parseInt(route.query.year);
    const month = parseInt(route.query.month) - 1;
    currentDate.value = new Date(year, month, 1);
  }
});

const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

const currentMonthText = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth() + 1;
  return `${year}年${month}月`;
});

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - (firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1));
  
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    const dateStr = date.toISOString().split('T')[0];
    const dateToday = new Date(date);
    dateToday.setHours(0, 0, 0, 0);
    
    days.push({
      date: dateStr,
      day: date.getDate(),
      isOtherMonth: date.getMonth() !== month,
      isToday: dateToday.getTime() === today.getTime()
    });
  }
  
  return days;
});

const getDayTasks = (date) => {
  const tasks = taskStore.currentSpaceTasks;
  return tasks.filter(task => {
    if (!task.dueDate) return false;
    const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
    return taskDate === date;
  });
};

const formatSelectedDay = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
};

const getPriorityText = (priority) => {
  const map = { high: '高', medium: '中', low: '低' };
  return map[priority] || priority;
};

const previousMonth = () => {
  const newDate = new Date(currentDate.value);
  newDate.setMonth(newDate.getMonth() - 1);
  currentDate.value = newDate;
};

const nextMonth = () => {
  const newDate = new Date(currentDate.value);
  newDate.setMonth(newDate.getMonth() + 1);
  currentDate.value = newDate;
};

const goToToday = () => {
  currentDate.value = new Date();
  const today = new Date();
  selectedDay.value = today.toISOString().split('T')[0];
};

const selectDay = (date) => {
  selectedDay.value = date;
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

.month-nav {
  display: flex;
  align-items: center;
  gap: 16px;
}

.calendar {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow);
  margin-bottom: 20px;
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.calendar-day-header {
  text-align: center;
  font-weight: 600;
  color: var(--text-primary);
  padding: 8px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.calendar-day {
  aspect-ratio: 1;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  background: white;
}

.calendar-day:hover {
  background: var(--bg-color);
  border-color: var(--primary-color);
}

.calendar-day.other-month {
  opacity: 0.3;
}

.calendar-day.today {
  border-color: var(--primary-color);
  background: #e8f4f8;
}

.calendar-day.has-tasks {
  border-color: var(--secondary-color);
}

.day-number {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.day-tasks-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 4px;
}

.task-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-secondary);
}

.task-dot.priority-high {
  background: var(--danger-color);
}

.task-dot.priority-medium {
  background: var(--warning-color);
}

.task-dot.priority-low {
  background: var(--text-secondary);
}

.task-more {
  font-size: 10px;
  color: var(--text-secondary);
}

.task-count-badge {
  position: absolute;
  bottom: 4px;
  right: 4px;
  font-size: 10px;
  color: var(--text-secondary);
}

.selected-day-tasks {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow);
}

.selected-day-tasks h3 {
  margin-bottom: 16px;
  color: var(--text-primary);
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: var(--bg-color);
  border-radius: 8px;
}

.task-item.completed {
  opacity: 0.6;
}

.task-checkbox input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  margin-top: 2px;
}

.task-content {
  flex: 1;
  cursor: pointer;
}

.task-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.task-title {
  font-size: 16px;
  font-weight: 500;
}

.task-description {
  font-size: 14px;
  color: var(--text-secondary);
}

.priority-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}
</style>
