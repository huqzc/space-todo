import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { TaskStore } from '@/utils/taskStore';

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref([]);
  const spaces = ref([]);
  const currentSpaceId = ref(null);
  const taskStore = new TaskStore();

  // 初始化：从 IndexedDB 加载数据
  const init = async () => {
    tasks.value = await taskStore.getTasks();
    spaces.value = await taskStore.getSpaces();
    
    // 如果没有空间，创建默认空间
    if (spaces.value.length === 0) {
      await initDefaultSpaces();
    }
    
    // 设置当前空间（从 localStorage 恢复或使用第一个空间）
    const savedSpaceId = localStorage.getItem('currentSpaceId');
    if (savedSpaceId && spaces.value.find(s => s.id === savedSpaceId)) {
      currentSpaceId.value = savedSpaceId;
    } else if (spaces.value.length > 0) {
      currentSpaceId.value = spaces.value[0].id;
    }
  };

  // 初始化默认空间
  const initDefaultSpaces = async () => {
    const defaultSpaces = [
      { id: 'work', name: '工作', icon: '💼', color: '#3b82f6', createdAt: new Date().toISOString() },
      { id: 'study', name: '学习', icon: '📚', color: '#10b981', createdAt: new Date().toISOString() },
      { id: 'life', name: '生活', icon: '🏠', color: '#f59e0b', createdAt: new Date().toISOString() }
    ];
    
    for (const space of defaultSpaces) {
      const rawSpace = JSON.parse(JSON.stringify(space));
      await taskStore.addSpace(rawSpace);
      spaces.value.push(space);
    }
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
      urgent: taskData.urgent || false,
      spaceId: taskData.spaceId || currentSpaceId.value // 自动关联到当前空间
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

  // ========== 空间管理方法 ==========

  // 获取所有空间
  const getSpaces = () => {
    return spaces.value;
  };

  // 获取当前空间
  const getCurrentSpace = () => {
    return spaces.value.find(s => s.id === currentSpaceId.value);
  };

  // 切换当前空间
  const setCurrentSpace = (spaceId) => {
    currentSpaceId.value = spaceId;
    localStorage.setItem('currentSpaceId', spaceId);
  };

  // 添加空间
  const addSpace = async (spaceData) => {
    const newSpace = {
      id: Date.now().toString(),
      name: spaceData.name || '新空间',
      icon: spaceData.icon || '📁',
      color: spaceData.color || '#6b7280',
      createdAt: new Date().toISOString()
    };

    spaces.value.push(newSpace);
    const rawSpace = JSON.parse(JSON.stringify(newSpace));
    await taskStore.addSpace(rawSpace);
    return newSpace;
  };

  // 更新空间
  const updateSpace = async (id, updates) => {
    const index = spaces.value.findIndex(s => s.id === id);
    if (index !== -1) {
      spaces.value[index] = {
        ...spaces.value[index],
        ...updates
      };
      const rawSpace = JSON.parse(JSON.stringify(spaces.value[index]));
      await taskStore.updateSpace(rawSpace);
      return spaces.value[index];
    }
    return null;
  };

  // 删除空间
  const deleteSpace = async (id) => {
    const index = spaces.value.findIndex(s => s.id === id);
    if (index !== -1) {
      spaces.value.splice(index, 1);
      await taskStore.deleteSpace(id);
      
      // 如果删除的是当前空间，切换到第一个空间
      if (currentSpaceId.value === id && spaces.value.length > 0) {
        setCurrentSpace(spaces.value[0].id);
      }
      return true;
    }
    return false;
  };

  // 导入空间
  const importSpaces = async (importedSpaces) => {
    spaces.value = importedSpaces;
    const rawSpaces = JSON.parse(JSON.stringify(importedSpaces));
    await taskStore.importSpaces(rawSpaces);
  };

  // 计算属性：当前空间的任务
  const currentSpaceTasks = computed(() => {
    return tasks.value.filter(t => t.spaceId === currentSpaceId.value);
  });

  // 计算属性：当前空间的未完成任务
  const currentSpaceIncompleteTasks = computed(() => {
    return currentSpaceTasks.value.filter(t => !t.completed);
  });

  // 计算属性：当前空间的已完成任务
  const currentSpaceCompletedTasks = computed(() => {
    return currentSpaceTasks.value.filter(t => t.completed);
  });

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
    spaces,
    currentSpaceId,
    getTasks,
    getTaskById,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    importTasks,
    getSpaces,
    getCurrentSpace,
    setCurrentSpace,
    addSpace,
    updateSpace,
    deleteSpace,
    importSpaces,
    currentSpaceTasks,
    currentSpaceIncompleteTasks,
    currentSpaceCompletedTasks,
    incompleteTasks,
    completedTasks,
    tasksByPriority
  };
});
