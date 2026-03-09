import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { TaskStore } from '@/utils/taskStore';

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref([]);
  const taskStore = new TaskStore();
  
  // 初始化：从 IndexedDB 加载数据
  const init = async () => {
    tasks.value = await taskStore.getTasks();
  };
  
  // 获取所有任务
  const getTasks = () => {
    return tasks.value;
  };
  
  // 根据 ID 获取任务
  const getTaskById = (id) => {
    return tasks.value.find(t => t.id === id);
  };
  
  // 添加任务
  const addTask = async (taskData) => {
    const now = new Date().toISOString();
    const newTask = {
      id: Date.now().toString(),
      title: taskData.title || '',
      description: taskData.description || '',
      createdAt: now,
      updatedAt: now,
      dueDate: taskData.dueDate || null,
      completed: false,
      completedAt: null,
      startedAt: null,
      priority: taskData.priority || 'medium',
      tags: taskData.tags || [],
      important: taskData.important || false,
      urgent: taskData.urgent || false
    };

    tasks.value.push(newTask);
    // 使用 JSON 序列化来移除 Vue 的响应式代理，避免 IndexedDB 的 DataCloneError
    const rawTask = JSON.parse(JSON.stringify(newTask));
    await taskStore.addTask(rawTask);
    return newTask;
  };
  
  // 更新任务
  const updateTask = async (id, updates) => {
    const index = tasks.value.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks.value[index] = { 
        ...tasks.value[index], 
        ...updates,
        updatedAt: new Date().toISOString()
      };
      // 使用 JSON 序列化来移除 Vue 的响应式代理，避免 IndexedDB 的 DataCloneError
      const rawTask = JSON.parse(JSON.stringify(tasks.value[index]));
      await taskStore.updateTask(rawTask);
      return tasks.value[index];
    }
    return null;
  };
  
  // 删除任务
  const deleteTask = async (id) => {
    const index = tasks.value.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks.value.splice(index, 1);
      await taskStore.deleteTask(id);
      return true;
    }
    return false;
  };
  
  // 切换完成状态
  const toggleComplete = async (id) => {
    const task = getTaskById(id);
    if (task) {
      const now = new Date().toISOString();
      const updates = { 
        completed: !task.completed,
        completedAt: task.completed ? null : now,
        updatedAt: now
      };
      // 如果任务从完成变为未完成，清除 startedAt
      if (!task.completed && task.startedAt) {
        updates.startedAt = null;
      }
      return await updateTask(id, updates);
    }
  };
  
  // 导入任务
  const importTasks = async (importedTasks) => {
    tasks.value = importedTasks;
    // 使用 JSON 序列化来移除 Vue 的响应式代理，避免 IndexedDB 的 DataCloneError
    const rawTasks = JSON.parse(JSON.stringify(importedTasks));
    await taskStore.importTasks(rawTasks);
  };
  
  // 计算属性：未完成任务
  const incompleteTasks = computed(() => {
    return tasks.value.filter(t => !t.completed);
  });
  
  // 计算属性：已完成任务
  const completedTasks = computed(() => {
    return tasks.value.filter(t => t.completed);
  });
  
  // 计算属性：按优先级排序
  const tasksByPriority = computed(() => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return [...tasks.value].sort((a, b) => {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  });
  
  // 初始化
  init();
  
  return {
    tasks,
    getTasks,
    getTaskById,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    importTasks,
    incompleteTasks,
    completedTasks,
    tasksByPriority
  };
});
