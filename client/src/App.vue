<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-container">
        <h1 class="nav-title">📋 待办事项管理系统</h1>
        <div class="nav-links">
          <router-link to="/" class="nav-link">任务列表</router-link>
          <router-link to="/week" class="nav-link">周视图</router-link>
          <router-link to="/month" class="nav-link">月视图</router-link>
          <router-link to="/year" class="nav-link">年视图</router-link>
          <router-link to="/quadrant" class="nav-link">四象限</router-link>
        </div>
        <div class="nav-actions">
          <button @click="exportData" class="btn btn-outline">导出数据</button>
          <label for="import-file" class="btn btn-outline" style="cursor: pointer;">
            导入数据
            <input
              id="import-file"
              type="file"
              accept=".json"
              @change="importData"
              style="display: none;"
            />
          </label>
        </div>
      </div>
    </nav>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useTaskStore } from '@/store/taskStore';

const taskStore = useTaskStore();

const exportData = () => {
  const tasks = taskStore.getTasks();
  const dataStr = JSON.stringify(tasks, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `todo-backup-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

const importData = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    if (Array.isArray(data)) {
      // 数据校验
      const validTasks = data.filter(task => {
        return task.id && task.title && task.createdAt;
      });
      
      if (validTasks.length > 0) {
        if (confirm(`确定要导入 ${validTasks.length} 条任务吗？这将覆盖现有数据。`)) {
          taskStore.importTasks(validTasks);
          alert('导入成功！');
        }
      } else {
        alert('导入的文件格式不正确或没有有效任务。');
      }
    } else {
      alert('导入的文件格式不正确。');
    }
  } catch (error) {
    alert('导入失败：' + error.message);
  }
  
  // 重置文件输入
  event.target.value = '';
};
</script>

<style scoped>
.navbar {
  background: var(--card-bg);
  box-shadow: var(--shadow);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
}

.nav-title {
  font-size: 24px;
  color: var(--primary-color);
  font-weight: 600;
}

.nav-links {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.nav-link {
  padding: 8px 16px;
  text-decoration: none;
  color: var(--text-primary);
  border-radius: 6px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-link:hover {
  background-color: var(--bg-color);
  color: var(--primary-color);
}

.nav-link.router-link-active {
  background-color: var(--primary-color);
  color: white;
}

.nav-actions {
  display: flex;
  gap: 10px;
}

.main-content {
  padding: 20px 0;
}
</style>
