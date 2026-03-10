<template>
  <div class="home-container">
    <div class="hero">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="emoji">📋</span>
          待办事项管理系统
        </h1>
        <p class="hero-tagline">
          简洁、高效、功能完整的任务管理工具
        </p>
        <p class="hero-description">
          支持多空间管理、多种视图、四象限分析，让你的任务井井有条
        </p>
        <div class="hero-actions">
          <button @click="goToApp" class="btn-primary">
            开始使用
            <span class="arrow">→</span>
          </button>
          <a href="https://github.com/yourusername/space-todo" target="_blank" class="btn-secondary">
            查看源码
          </a>
        </div>
      </div>
    </div>

    <div class="features">
      <div class="feature-grid">
        <div class="feature-card">
          <div class="feature-icon">🏢</div>
          <h3>多空间管理</h3>
          <p>创建多个独立空间，工作、学习、生活分类管理</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📅</div>
          <h3>多种视图</h3>
          <p>周视图、月视图、年视图，多角度查看任务</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🎯</div>
          <h3>四象限分析</h3>
          <p>艾森豪威尔矩阵，科学管理任务优先级</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">💾</div>
          <h3>本地存储</h3>
          <p>使用 IndexedDB，数据安全可靠，支持导入导出</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🎨</div>
          <h3>自定义空间</h3>
          <p>为每个空间设置名称、图标和颜色</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🔍</div>
          <h3>搜索过滤</h3>
          <p>快速搜索任务，按标签、优先级过滤</p>
        </div>
      </div>
    </div>

    <div class="tech-stack">
      <h2>技术栈</h2>
      <div class="tech-badges">
        <span class="badge">Vue 3</span>
        <span class="badge">Vue Router</span>
        <span class="badge">Pinia</span>
        <span class="badge">Vite</span>
        <span class="badge">IndexedDB</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goToApp = () => {
  router.push('/app');
};
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
}

.hero {
  padding: 80px 20px 60px;
  text-align: center;
  max-width: 960px;
  margin: 0 auto;
}

.hero-content {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 16px;
  line-height: 1.2;
}

.emoji {
  display: inline-block;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.hero-tagline {
  font-size: 24px;
  color: #476582;
  margin-bottom: 12px;
  font-weight: 500;
}

.hero-description {
  font-size: 16px;
  color: #6c757d;
  margin-bottom: 32px;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary {
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-primary .arrow {
  transition: transform 0.3s ease;
}

.btn-primary:hover .arrow {
  transform: translateX(4px);
}

.btn-secondary {
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  color: #667eea;
  background: white;
  border: 2px solid #667eea;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.btn-secondary:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

.features {
  padding: 60px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.feature-card {
  background: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  text-align: center;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.feature-card h3 {
  font-size: 20px;
  color: #2c3e50;
  margin-bottom: 12px;
  font-weight: 600;
}

.feature-card p {
  font-size: 14px;
  color: #6c757d;
  line-height: 1.6;
}

.tech-stack {
  padding: 60px 20px 80px;
  text-align: center;
  max-width: 960px;
  margin: 0 auto;
}

.tech-stack h2 {
  font-size: 32px;
  color: #2c3e50;
  margin-bottom: 24px;
  font-weight: 600;
}

.tech-badges {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.badge {
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 36px;
  }

  .hero-tagline {
    font-size: 20px;
  }

  .feature-grid {
    grid-template-columns: 1fr;
  }
}
</style>
