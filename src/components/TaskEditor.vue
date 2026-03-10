<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ task ? '编辑任务' : '新建任务' }}</h3>
        <button @click="close" class="close-btn">×</button>
      </div>
      
      <form @submit.prevent="save" class="task-form">
        <div class="form-group">
          <label>标题 *</label>
          <input
            v-model="formData.title"
            type="text"
            class="input"
            required
            placeholder="输入任务标题"
          />
        </div>
        
        <div class="form-group">
          <label>描述</label>
          <textarea
            v-model="formData.description"
            class="textarea"
            placeholder="输入任务描述"
          />
        </div>
        
        <div class="form-group">
          <label>所属空间</label>
          <select v-model="formData.spaceId" class="select">
            <option v-for="space in spaces" :key="space.id" :value="space.id">
              {{ space.icon }} {{ space.name }}
            </option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>截止时间</label>
            <input
              v-model="formData.dueDate"
              type="date"
              class="input"
            />
          </div>

          <div class="form-group">
            <label>优先级</label>
            <select v-model="formData.priority" class="select">
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>
              <input
                v-model="formData.important"
                type="checkbox"
              />
              重要
            </label>
          </div>

          <div class="form-group">
            <label>
              <input
                v-model="formData.urgent"
                type="checkbox"
              />
              紧急
            </label>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>
              <input
                v-model="formData.started"
                type="checkbox"
              />
              已开始
            </label>
          </div>

          <div class="form-group">
            <label>
              <input
                v-model="formData.completed"
                type="checkbox"
                :disabled="true"
              />
              已完成
            </label>
          </div>
        </div>

        <div v-if="task && task.completedAt" class="task-meta-info">
          <div class="meta-item">
            <span class="meta-label">创建时间:</span>
            <span class="meta-value">{{ formatDateTime(task.createdAt) }}</span>
          </div>
          <div v-if="task.updatedAt" class="meta-item">
            <span class="meta-label">更新时间:</span>
            <span class="meta-value">{{ formatDateTime(task.updatedAt) }}</span>
          </div>
          <div v-if="task.startedAt" class="meta-item">
            <span class="meta-label">开始时间:</span>
            <span class="meta-value">{{ formatDateTime(task.startedAt) }}</span>
          </div>
          <div v-if="task.completedAt" class="meta-item">
            <span class="meta-label">完成时间:</span>
            <span class="meta-value">{{ formatDateTime(task.completedAt) }}</span>
          </div>
        </div>
        
        <div class="form-group">
          <label>标签（用逗号分隔）</label>
          <input
            v-model="tagsInput"
            type="text"
            class="input"
            placeholder="例如：工作, 学习, 生活"
          />
        </div>
        
        <div class="form-actions">
          <button type="button" @click="close" class="btn btn-outline">取消</button>
          <button type="submit" class="btn btn-primary">保存</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useTaskStore } from '@/store/taskStore';

const props = defineProps({
  task: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'save']);

const taskStore = useTaskStore();
const spaces = computed(() => taskStore.getSpaces());

const formData = ref({
  title: '',
  description: '',
  dueDate: '',
  priority: 'medium',
  important: false,
  urgent: false,
  started: false,
  completed: false,
  tags: [],
  spaceId: taskStore.currentSpaceId
});

const tagsInput = ref('');

// 先定义 resetForm 函数
const resetForm = () => {
  formData.value = {
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    important: false,
    urgent: false,
    tags: [],
    spaceId: taskStore.currentSpaceId
  };
  tagsInput.value = '';
};

// 然后定义 watch，这样 resetForm 就可以在 immediate 模式下使用了
watch(() => props.task, (newTask) => {
  if (newTask) {
    formData.value = {
      title: newTask.title || '',
      description: newTask.description || '',
      dueDate: newTask.dueDate ? newTask.dueDate.split('T')[0] : '',
      priority: newTask.priority || 'medium',
      important: newTask.important || false,
      urgent: newTask.urgent || false,
      started: !!newTask.startedAt,
      completed: newTask.completed || false,
      tags: newTask.tags || [],
      spaceId: newTask.spaceId || taskStore.currentSpaceId
    };
    tagsInput.value = newTask.tags?.join(', ') || '';
  } else {
    resetForm();
  }
}, { immediate: true });

const close = () => {
  emit('close');
};

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const save = () => {
  const tags = tagsInput.value
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);

  const now = new Date().toISOString();
  const taskData = {
    ...formData.value,
    tags,
    dueDate: formData.value.dueDate || null,
    startedAt: formData.value.started ? (props.task?.startedAt || now) : null
  };

  // 如果任务已完成，保留原有的 completedAt 或设置为当前时间
  if (props.task?.completed) {
    taskData.completedAt = props.task.completedAt || now;
  } else if (formData.value.completed) {
    taskData.completedAt = now;
  } else {
    taskData.completedAt = null;
  }

  emit('save', taskData);
  resetForm();
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: var(--card-bg);
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 32px;
  color: var(--text-secondary);
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
}

.close-btn:hover {
  color: var(--text-primary);
}

.task-form {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-primary);
}

.form-group label input[type="checkbox"] {
  margin-right: 8px;
  width: auto;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.task-meta-info {
  background: var(--bg-color);
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
  border: 1px solid var(--border-color);
}

.task-meta-info .meta-item {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
}

.task-meta-info .meta-item:last-child {
  margin-bottom: 0;
}

.task-meta-info .meta-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.task-meta-info .meta-value {
  color: var(--text-primary);
}
</style>
