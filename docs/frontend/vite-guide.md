# Vite 配置指南

Vite 是下一代前端构建工具，开发体验极佳，构建速度飞快。

## 快速开始

```bash
# 创建项目
npm create vite@latest my-app -- --template react-ts

# 进入项目
cd my-app

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 可用模板

| 模板 | 命令 |
|------|------|
| React + TS | `--template react-ts` |
| React + JS | `--template react` |
| Vue + TS | `--template vue-ts` |
| Vanilla + TS | `--template vanilla-ts` |

## 基础配置

### vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  
  // 开发服务器配置
  server: {
    port: 3000,
    open: true, // 自动打开浏览器
    host: true, // 监听所有地址
  },
  
  // 构建配置
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  
  // 路径别名
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
});
```

### tsconfig.json 配合别名

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@hooks/*": ["src/hooks/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
```

## 开发服务器

### 代理配置

```typescript
export default defineConfig({
  server: {
    proxy: {
      // 字符串简写
      '/foo': 'http://localhost:4567',
      
      // 完整配置
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      
      // WebSocket 代理
      '/socket.io': {
        target: 'ws://localhost:5174',
        ws: true,
      },
    },
  },
});
```

### HTTPS 配置

```typescript
import fs from 'fs';

export default defineConfig({
  server: {
    https: {
      key: fs.readFileSync('keys/localhost-key.pem'),
      cert: fs.readFileSync('keys/localhost.pem'),
    },
  },
});

// 或使用 @vitejs/plugin-basic-ssl 快速启用
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [basicSsl()],
});
```

## 构建优化

### 代码分割

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // 分割第三方库
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
        
        // 或使用函数动态分割
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) {
              return 'react-vendor';
            }
            if (id.includes('lodash')) {
              return 'lodash';
            }
            return 'vendor';
          }
        },
      },
    },
  },
});
```

### 压缩配置

```typescript
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ],
  
  build: {
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    
    // 压缩选项
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
```

### 分析打包体积

```bash
npm install rollup-plugin-visualizer -D
```

```typescript
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    visualizer({
      open: true,
      filename: 'stats.html',
      gzipSize: true,
    }),
  ],
});
```

## 环境变量

### .env 文件

```bash
# .env - 所有环境
VITE_APP_TITLE=My App

# .env.development - 开发环境
VITE_API_URL=http://localhost:8080

# .env.production - 生产环境
VITE_API_URL=https://api.example.com
```

### 使用环境变量

```typescript
// 在代码中访问
console.log(import.meta.env.VITE_API_URL);
console.log(import.meta.env.VITE_APP_TITLE);

// 内置变量
console.log(import.meta.env.MODE);     // 'development' | 'production'
console.log(import.meta.env.DEV);      // true | false
console.log(import.meta.env.PROD);     // true | false
console.log(import.meta.env.BASE_URL); // base 路径
```

### TypeScript 类型定义

```typescript
// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_TITLE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

## 常用插件

### 自动导入

```bash
npm install unplugin-auto-import unplugin-react-components -D
```

```typescript
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-react-components/vite';

export default defineConfig({
  plugins: [
    AutoImport({
      imports: ['react', 'react-router-dom'],
      dts: 'src/auto-imports.d.ts',
    }),
    Components({
      dirs: ['src/components'],
      dts: 'src/components.d.ts',
    }),
  ],
});
```

### SVG 组件

```bash
npm install vite-plugin-svgr -D
```

```typescript
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [
    svgr({
      svgrOptions: {
        icon: true,
      },
    }),
  ],
});

// 使用
import Logo from './logo.svg?react';

function App() {
  return <Logo className="logo" />;
}
```

### PWA 支持

```bash
npm install vite-plugin-pwa -D
```

```typescript
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'My App',
        short_name: 'App',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
});
```

## CSS 配置

### CSS Modules

```typescript
// 默认支持，文件名以 .module.css 结尾即可
// Button.module.css

export default defineConfig({
  css: {
    modules: {
      localsConvention: 'camelCase', // 类名转驼峰
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    },
  },
});
```

### 预处理器

```bash
# 安装需要的预处理器
npm install sass -D
npm install less -D
npm install stylus -D
```

```typescript
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`,
      },
      less: {
        javascriptEnabled: true,
        additionalData: `@import "@/styles/variables.less";`,
      },
    },
  },
});
```

### PostCSS

```typescript
// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

## 静态资源处理

### 资源导入

```typescript
// URL 导入
import imgUrl from './img.png';
document.getElementById('img').src = imgUrl;

// 原始内容导入
import shaderCode from './shader.glsl?raw';

// Web Worker
import Worker from './worker.js?worker';
const worker = new Worker();

// JSON
import data from './data.json';
```

### public 目录

```
public/
  favicon.ico
  robots.txt
  images/
    logo.png
```

```html
<!-- 直接引用，不会被处理 -->
<img src="/images/logo.png" alt="logo" />
```

### 资源内联

```typescript
export default defineConfig({
  build: {
    assetsInlineLimit: 4096, // 4KB 以下的资源内联为 base64
  },
});
```

## 多页应用

```typescript
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin/index.html'),
        login: resolve(__dirname, 'login/index.html'),
      },
    },
  },
});
```

## 库模式

构建可发布的库：

```typescript
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [dts()],
  
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MyLib',
      fileName: (format) => `my-lib.${format}.js`,
    },
    rollupOptions: {
      // 外部化依赖
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
});
```

## 完整配置示例

```typescript
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const isProd = mode === 'production';
  
  return {
    plugins: [
      react(),
      isProd && viteCompression({ algorithm: 'gzip' }),
      isProd && visualizer({ open: false, filename: 'stats.html' }),
    ].filter(Boolean),
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    
    server: {
      port: 3000,
      open: true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    
    build: {
      outDir: 'dist',
      sourcemap: !isProd,
      minify: isProd ? 'terser' : false,
      terserOptions: isProd ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      } : undefined,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
    },
    
    css: {
      modules: {
        localsConvention: 'camelCase',
      },
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`,
        },
      },
    },
  };
});
```

## 常见问题

### 别名不生效

确保 `vite.config.ts` 和 `tsconfig.json` 都配置了相同的别名。

### HMR 不工作

检查组件是否正确导出，React 组件需要具名导出或使用 `React.memo` 包裹。

### 依赖优化

```typescript
export default defineConfig({
  optimizeDeps: {
    include: ['lodash-es'], // 预构建
    exclude: ['some-lib'],  // 排除预构建
  },
});
```

## 总结

| 配置项 | 说明 |
|--------|------|
| `plugins` | 插件配置 |
| `resolve.alias` | 路径别名 |
| `server` | 开发服务器配置 |
| `build` | 构建配置 |
| `css` | CSS 相关配置 |
| `optimizeDeps` | 依赖优化配置 |
| `envPrefix` | 环境变量前缀（默认 VITE_） |
