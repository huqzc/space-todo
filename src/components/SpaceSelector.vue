<template>
  <div class="space-selector">
    <div class="current-space" @click="toggleDropdown">
      <span class="space-icon">{{ currentSpace?.icon || '📁' }}</span>
      <span class="space-name">{{ currentSpace?.name || '选择空间' }}</span>
      <span class="dropdown-arrow">▼</span>
    </div>
    
    <div v-if="showDropdown" class="space-dropdown">
      <div class="space-list">
        <div
          v-for="space in spaces"
          :key="space.id"
          class="space-item"
          :class="{ active: space.id === currentSpaceId }"
          @click="selectSpace(space.id)"
        >
          <span class="space-icon">{{ space.icon }}</span>
          <span class="space-name">{{ space.name }}</span>
          <div class="space-actions" @click.stop>
            <button @click="editSpace(space)" class="btn-icon" title="编辑">✏️</button>
            <button @click="confirmDeleteSpace(space)" class="btn-icon" title="删除">🗑️</button>
          </div>
        </div>
      </div>
      
      <div class="space-footer">
        <button @click="showAddSpaceModal = true" class="btn btn-primary btn-sm">
          ➕ 新建空间
        </button>
      </div>
    </div>

    <!-- 添加/编辑空间模态框 -->
    <div v-if="showAddSpaceModal || editingSpace" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h3>{{ editingSpace ? '编辑空间' : '新建空间' }}</h3>
        <form @submit.prevent="saveSpace">
          <div class="form-group">
            <label>空间名称</label>
            <input
              v-model="spaceForm.name"
              type="text"
              class="form-control"
              placeholder="例如：工作、学习、生活"
              required
            />
          </div>
          
          <div class="form-group">
            <label>图标</label>
            <div class="icon-picker">
              <div
                v-for="icon in iconOptions"
                :key="icon"
                class="icon-option"
                :class="{ selected: spaceForm.icon === icon }"
                @click="spaceForm.icon = icon"
              >
                {{ icon }}
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label>颜色</label>
            <div class="color-picker">
              <div
                v-for="color in colorOptions"
                :key="color"
                class="color-option"
                :class="{ selected: spaceForm.color === color }"
                :style="{ backgroundColor: color }"
                @click="spaceForm.color = color"
              ></div>
            </div>
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn btn-outline">取消</button>
            <button type="submit" class="btn btn-primary">保存</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useTaskStore } from '@/store/taskStore';

const taskStore = useTaskStore();
const showDropdown = ref(false);
const showAddSpaceModal = ref(false);
const editingSpace = ref(null);

const spaceForm = ref({
  name: '',
  icon: '📁',
  color: '#6b7280'
});

const iconOptions = ['💼', '📚', '🏠', '🎯', '💡', '🎨', '🏃', '🍔', '🎮', '✈️', '💰', '🏥'];
const colorOptions = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#6b7280'];

const spaces = computed(() => taskStore.getSpaces());
const currentSpaceId = computed(() => taskStore.currentSpaceId);
const currentSpace = computed(() => taskStore.getCurrentSpace());

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const selectSpace = (spaceId) => {
  taskStore.setCurrentSpace(spaceId);
  showDropdown.value = false;
};

const editSpace = (space) => {
  editingSpace.value = space;
  spaceForm.value = {
    name: space.name,
    icon: space.icon,
    color: space.color
  };
};

const confirmDeleteSpace = (space) => {
  if (spaces.value.length <= 1) {
    alert('至少需要保留一个空间');
    return;
  }
  
  if (confirm(`确定要删除空间"${space.name}"吗？该空间下的所有任务也将被删除。`)) {
    taskStore.deleteSpace(space.id);
  }
};

const saveSpace = async () => {
  if (editingSpace.value) {
    await taskStore.updateSpace(editingSpace.value.id, spaceForm.value);
  } else {
    await taskStore.addSpace(spaceForm.value);
  }
  closeModal();
};

const closeModal = () => {
  showAddSpaceModal.value = false;
  editingSpace.value = null;
  spaceForm.value = {
    name: '',
    icon: '📁',
    color: '#6b7280'
  };
};

// 点击外部关闭下拉菜单
const handleClickOutside = (event) => {
  const selector = document.querySelector('.space-selector');
  if (selector && !selector.contains(event.target)) {
    showDropdown.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.space-selector {
  position: relative;
}

.current-space {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px;
}

.current-space:hover {
  background: var(--bg-color);
  border-color: var(--primary-color);
}

.space-icon {
  font-size: 20px;
}

.space-name {
  flex: 1;
  font-weight: 500;
  color: var(--text-primary);
}

.dropdown-arrow {
  font-size: 12px;
  color: var(--text-secondary);
  transition: transform 0.3s ease;
}

.space-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 280px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: var(--shadow);
  z-index: 1000;
  overflow: hidden;
}

.space-list {
  max-height: 300px;
  overflow-y: auto;
}

.space-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s ease;
  border-bottom: 1px solid var(--border-color);
}

.space-item:hover {
  background: var(--bg-color);
}

.space-item.active {
  background: var(--primary-color);
  color: white;
}

.space-item.active .space-name {
  color: white;
}

.space-item .space-name {
  flex: 1;
  font-weight: 500;
}

.space-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.space-item:hover .space-actions {
  opacity: 1;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.btn-icon:hover {
  background: rgba(0, 0, 0, 0.1);
}

.space-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
}

.btn-sm {
  padding: 6px 12px;
  font-size: 14px;
  width: 100%;
}

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
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin: 0 0 20px 0;
  color: var(--text-primary);
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

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  background: var(--bg-color);
  color: var(--text-primary);
}

.icon-picker {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}

.icon-option {
  font-size: 24px;
  padding: 8px;
  text-align: center;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-option:hover {
  background: var(--bg-color);
}

.icon-option.selected {
  border-color: var(--primary-color);
  background: var(--bg-color);
}

.color-picker {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
}

.color-option {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.2s ease;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.selected {
  border-color: var(--text-primary);
  transform: scale(1.1);
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}
</style>
