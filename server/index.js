import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 静态文件服务（Vue 构建后的文件）
app.use(express.static(join(__dirname, '../dist')));

// API 路由
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Todo API Server is running' });
});

// 由于使用浏览器本地存储，API 主要用于健康检查
// 实际数据操作在前端通过 TaskStore 完成

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
