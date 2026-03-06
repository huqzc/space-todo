/**
 * TaskStore - 使用 IndexedDB 存储任务数据
 */
export class TaskStore {
  constructor() {
    this.dbName = 'TodoDB';
    this.storeName = 'tasks';
    this.version = 1;
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
        if (!db.objectStoreNames.contains(this.storeName)) {
          const objectStore = db.createObjectStore(this.storeName, { keyPath: 'id' });
          objectStore.createIndex('createdAt', 'createdAt', { unique: false });
          objectStore.createIndex('dueDate', 'dueDate', { unique: false });
          objectStore.createIndex('completed', 'completed', { unique: false });
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
}
