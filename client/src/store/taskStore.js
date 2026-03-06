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
    const newTask = {
      id: Date.now().toString(),
      title: taskData.title || '',
      description: taskData.description || '',
      createdAt: new Date().toISOString(),
      dueDate: taskData.dueDate || null,
      completed: false,
      priority: taskData.priority || 'medium',
      tags: taskData.tags || [],
      important: taskData.important || false,
      urgent: taskData.urgent || false
    };
    
    tasks.value.push(newTask);
    await taskStore.addTask(newTask);
    return newTask;
  };
  
  // 更新任务
  const updateTask = async (id, updates) => {
    const index = tasks.value.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks.value[index] = { ...tasks.value[index], ...updates };
      await taskStore.updateTask(tasks.value[index]);
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
      return await updateTask(id, { completed: !task.completed });
    }
  };
  
  // 导入任务
  const importTasks = async (importedTasks) => {
    tasks.value = importedTasks;
    await taskStore.importTasks(importedTasks);
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
