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
import { ref, watch, onMounted } from 'vue';

const props = defineProps({
  task: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'save']);

const formData = ref({
  title: '',
  description: '',
  dueDate: '',
  priority: 'medium',
  important: false,
  urgent: false,
  tags: []
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
    tags: []
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
      tags: newTask.tags || []
    };
    tagsInput.value = newTask.tags?.join(', ') || '';
  } else {
    resetForm();
  }
}, { immediate: true });

const close = () => {
  emit('close');
};

const save = () => {
  const tags = tagsInput.value
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
  
  const taskData = {
    ...formData.value,
    tags,
    dueDate: formData.value.dueDate || null
  };
  
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
</style>
