---
slug: file-upload
title: 文件上传完整方案
authors: mason
tags: [文件上传, 前端, 后端]
---

文件上传是 Web 开发中的常见需求。本文介绍文件上传的完整实现方案，包括大文件分片、断点续传等。

<!--truncate-->

## 🎯 上传方式

| 方式 | 适用场景 | 复杂度 |
|------|---------|--------|
| 普通上传 | 小文件 | 低 |
| 分片上传 | 大文件 | 中 |
| 断点续传 | 大文件、网络不稳 | 高 |
| 秒传 | 已存在文件 | 中 |

---

## 📤 基础上传

### 前端

```tsx
function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        console.log('上传成功');
      }
    };

    xhr.open('POST', '/api/upload');
    xhr.send(formData);
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={handleUpload}>上传</button>
      <progress value={progress} max="100" />
    </div>
  );
}
```

### 使用 fetch

```typescript
async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  return response.json();
}
```

### 后端 (Node.js)

```javascript
import express from 'express';
import multer from 'multer';

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  res.json({
    filename: req.file.filename,
    size: req.file.size,
    path: req.file.path,
  });
});
```

---

## 📊 分片上传

### 前端实现

```typescript
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

async function uploadLargeFile(file: File) {
  const chunks = Math.ceil(file.size / CHUNK_SIZE);
  const fileHash = await calculateHash(file);

  for (let i = 0; i < chunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('hash', fileHash);
    formData.append('index', String(i));
    formData.append('total', String(chunks));
    formData.append('filename', file.name);

    await fetch('/api/upload/chunk', {
      method: 'POST',
      body: formData,
    });

    console.log(`Uploaded chunk ${i + 1}/${chunks}`);
  }

  // 合并分片
  await fetch('/api/upload/merge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      hash: fileHash,
      filename: file.name,
      total: chunks,
    }),
  });
}

// 计算文件 hash
async function calculateHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

### 并发上传

```typescript
async function uploadWithConcurrency(file: File, concurrency = 3) {
  const chunks = createChunks(file);
  const fileHash = await calculateHash(file);
  
  let current = 0;
  const results: Promise<void>[] = [];

  const uploadNext = async () => {
    if (current >= chunks.length) return;
    
    const index = current++;
    const chunk = chunks[index];
    
    await uploadChunk(chunk, fileHash, index, chunks.length);
    await uploadNext();
  };

  for (let i = 0; i < concurrency; i++) {
    results.push(uploadNext());
  }

  await Promise.all(results);
  await mergeChunks(fileHash, file.name, chunks.length);
}
```

### 后端合并

```javascript
import fs from 'fs';
import path from 'path';

app.post('/api/upload/chunk', upload.single('chunk'), (req, res) => {
  const { hash, index } = req.body;
  const chunkDir = path.join('uploads', hash);
  
  if (!fs.existsSync(chunkDir)) {
    fs.mkdirSync(chunkDir, { recursive: true });
  }
  
  fs.renameSync(req.file.path, path.join(chunkDir, index));
  res.json({ success: true });
});

app.post('/api/upload/merge', async (req, res) => {
  const { hash, filename, total } = req.body;
  const chunkDir = path.join('uploads', hash);
  const filePath = path.join('uploads', filename);
  
  const writeStream = fs.createWriteStream(filePath);
  
  for (let i = 0; i < total; i++) {
    const chunkPath = path.join(chunkDir, String(i));
    const data = fs.readFileSync(chunkPath);
    writeStream.write(data);
    fs.unlinkSync(chunkPath);
  }
  
  writeStream.end();
  fs.rmdirSync(chunkDir);
  
  res.json({ success: true, path: filePath });
});
```

---

## 🔄 断点续传

### 前端

```typescript
async function resumableUpload(file: File) {
  const fileHash = await calculateHash(file);
  const chunks = createChunks(file);

  // 查询已上传分片
  const { uploaded } = await fetch(`/api/upload/status?hash=${fileHash}`)
    .then(res => res.json());

  for (let i = 0; i < chunks.length; i++) {
    // 跳过已上传
    if (uploaded.includes(i)) continue;

    await uploadChunk(chunks[i], fileHash, i, chunks.length);
  }

  await mergeChunks(fileHash, file.name, chunks.length);
}
```

### 后端状态查询

```javascript
app.get('/api/upload/status', (req, res) => {
  const { hash } = req.query;
  const chunkDir = path.join('uploads', hash);
  
  if (!fs.existsSync(chunkDir)) {
    return res.json({ uploaded: [] });
  }
  
  const uploaded = fs.readdirSync(chunkDir)
    .map(name => parseInt(name))
    .sort((a, b) => a - b);
  
  res.json({ uploaded });
});
```

---

## ⚡ 秒传

```typescript
async function quickUpload(file: File) {
  const fileHash = await calculateHash(file);

  // 检查是否已存在
  const { exists, url } = await fetch(`/api/upload/check?hash=${fileHash}`)
    .then(res => res.json());

  if (exists) {
    console.log('秒传成功');
    return url;
  }

  // 正常上传
  return await uploadLargeFile(file);
}
```

```javascript
// 后端
app.get('/api/upload/check', (req, res) => {
  const { hash } = req.query;
  const file = db.files.findByHash(hash);
  
  if (file) {
    res.json({ exists: true, url: file.url });
  } else {
    res.json({ exists: false });
  }
});
```

---

## 🖼️ 图片压缩

```typescript
function compressImage(file: File, maxWidth = 1920, quality = 0.8): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    img.onload = () => {
      let { width, height } = img;

      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => resolve(blob!),
        'image/jpeg',
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
}
```

---

## 🎨 拖拽上传

```tsx
function DragDropUpload() {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    files.forEach(uploadFile);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`drop-zone ${isDragging ? 'active' : ''}`}
    >
      拖拽文件到这里上传
    </div>
  );
}
```

---

## ✅ 最佳实践

```markdown
1. 文件验证
   - 类型检查（MIME + 扩展名）
   - 大小限制
   - 内容检查（防恶意文件）

2. 用户体验
   - 进度显示
   - 取消上传
   - 错误重试
   - 预览功能

3. 性能优化
   - 分片上传
   - 并发控制
   - 压缩处理

4. 安全
   - 文件名处理
   - 存储隔离
   - 访问控制
```

---

文件上传看似简单，要做好需要考虑很多细节。根据业务场景选择合适的方案。
