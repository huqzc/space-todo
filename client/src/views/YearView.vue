<template>
  <div class="container">
    <div class="header">
      <div class="year-nav">
        <button @click="previousYear" class="btn btn-outline">← 上一年</button>
        <h2>{{ currentYear }}年</h2>
        <button @click="nextYear" class="btn btn-outline">下一年 →</button>
        <button @click="goToToday" class="btn btn-primary">今年</button>
      </div>
    </div>
    
    <div class="year-grid">
      <div
        v-for="month in months"
        :key="month.month"
        class="month-card"
        @click="goToMonth(month.month)"
      >
        <div class="month-header">
          <h3>{{ month.monthName }}</h3>
        </div>
        <div class="month-stats">
          <div class="stat-item">
            <span class="stat-label">任务数</span>
            <span class="stat-value">{{ month.taskCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">完成率</span>
            <span class="stat-value">{{ month.completionRate }}%</span>
          </div>
        </div>
        <div class="month-progress">
          <div
            class="progress-bar"
            :style="{ width: `${month.completionRate}%` }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useTaskStore } from '@/store/taskStore';

const router = useRouter();
const taskStore = useTaskStore();
const currentYear = ref(new Date().getFullYear());

const monthNames = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月'
];

const months = computed(() => {
  const tasks = taskStore.getTasks();
  const yearMonths = [];
  
  for (let i = 0; i < 12; i++) {
    const monthStart = new Date(currentYear.value, i, 1);
    const monthEnd = new Date(currentYear.value, i + 1, 0);
    
    const monthTasks = tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate >= monthStart && taskDate <= monthEnd;
    });
    
    const completedTasks = monthTasks.filter(task => task.completed);
    const taskCount = monthTasks.length;
    const completionRate = taskCount > 0
      ? Math.round((completedTasks.length / taskCount) * 100)
      : 0;
    
    yearMonths.push({
      month: i + 1,
      monthName: monthNames[i],
      taskCount,
      completedCount: completedTasks.length,
      completionRate
    });
  }
  
  return yearMonths;
});

const previousYear = () => {
  currentYear.value -= 1;
};

const nextYear = () => {
  currentYear.value += 1;
};

const goToToday = () => {
  currentYear.value = new Date().getFullYear();
};

const goToMonth = (month) => {
  router.push({
    name: 'Month',
    query: { year: currentYear.value, month: month }
  });
};
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.year-nav {
  display: flex;
  align-items: center;
  gap: 16px;
}

.year-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.month-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow);
  cursor: pointer;
  transition: all 0.3s ease;
}

.month-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

.month-header {
  margin-bottom: 16px;
}

.month-header h3 {
  font-size: 20px;
  color: var(--primary-color);
  font-weight: 600;
}

.month-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 16px;
  padding: 16px;
  background: var(--bg-color);
  border-radius: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--primary-color);
}

.month-progress {
  height: 8px;
  background: var(--bg-color);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  transition: width 0.3s ease;
}
</style>
