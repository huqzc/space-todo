/**
 * TaskStore - 使用 IndexedDB 存储任务数据和空间数据
 */
export class TaskStore {
  constructor() {
    this.dbName = 'TodoDB';
    this.storeName = 'tasks';
    this.spacesStoreName = 'spaces';
    this.version = 2; // 升级版本以支持空间功能
    this.db = null;
    this.init();
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // 创建 tasks 对象存储
        if (!db.objectStoreNames.contains(this.storeName)) {
          const objectStore = db.createObjectStore(this.storeName, { keyPath: 'id' });
          objectStore.createIndex('createdAt', 'createdAt', { unique: false });
          objectStore.createIndex('dueDate', 'dueDate', { unique: false });
          objectStore.createIndex('completed', 'completed', { unique: false });
          objectStore.createIndex('spaceId', 'spaceId', { unique: false });
        } else {
          // 如果已存在，添加 spaceId 索引
          const transaction = event.target.transaction;
          const objectStore = transaction.objectStore(this.storeName);
          if (!objectStore.indexNames.contains('spaceId')) {
            objectStore.createIndex('spaceId', 'spaceId', { unique: false });
          }
        }
        
        // 创建 spaces 对象存储
        if (!db.objectStoreNames.contains(this.spacesStoreName)) {
          const spacesStore = db.createObjectStore(this.spacesStoreName, { keyPath: 'id' });
          spacesStore.createIndex('name', 'name', { unique: false });
          spacesStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }
  
  async getTasks() {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }
  
  async addTask(task) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.add(task);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }
  
  async updateTask(task) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(task);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }
  
  async deleteTask(id) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }
  
  async importTasks(tasks) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      // 清空现有数据
      store.clear();

      // 添加新数据
      let completed = 0;
      let errors = 0;

      tasks.forEach(task => {
        const request = store.add(task);
        request.onsuccess = () => {
          completed++;
          if (completed + errors === tasks.length) {
            resolve();
          }
        };
        request.onerror = () => {
          errors++;
          if (completed + errors === tasks.length) {
            if (errors > 0) {
              reject(new Error(`导入失败 ${errors} 条任务`));
            } else {
              resolve();
            }
          }
        };
      });

      if (tasks.length === 0) {
        resolve();
      }
    });
  }

  // ========== 空间管理方法 ==========

  async getSpaces() {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.spacesStoreName], 'readonly');
      const store = transaction.objectStore(this.spacesStoreName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async addSpace(space) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.spacesStoreName], 'readwrite');
      const store = transaction.objectStore(this.spacesStoreName);
      const request = store.add(space);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async updateSpace(space) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.spacesStoreName], 'readwrite');
      const store = transaction.objectStore(this.spacesStoreName);
      const request = store.put(space);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async deleteSpace(id) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.spacesStoreName], 'readwrite');
      const store = transaction.objectStore(this.spacesStoreName);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async importSpaces(spaces) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.spacesStoreName], 'readwrite');
      const store = transaction.objectStore(this.spacesStoreName);

      // 清空现有数据
      store.clear();

      // 添加新数据
      let completed = 0;
      let errors = 0;

      spaces.forEach(space => {
        const request = store.add(space);
        request.onsuccess = () => {
          completed++;
          if (completed + errors === spaces.length) {
            resolve();
          }
        };
        request.onerror = () => {
          errors++;
          if (completed + errors === spaces.length) {
            if (errors > 0) {
              reject(new Error(`导入失败 ${errors} 个空间`));
            } else {
              resolve();
            }
          }
        };
      });

      if (spaces.length === 0) {
        resolve();
      }
    });
  }
}
