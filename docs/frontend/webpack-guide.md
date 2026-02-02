# Webpack 配置详解

Webpack 是最流行的前端打包工具，理解其配置对前端工程化至关重要。

## 核心概念

| 概念 | 说明 |
|------|------|
| Entry | 入口文件 |
| Output | 输出配置 |
| Loader | 处理非 JS 文件 |
| Plugin | 扩展功能 |
| Mode | 开发/生产模式 |

## 基础配置

### 安装

```bash
npm install webpack webpack-cli webpack-dev-server -D
```

### 最小配置

```javascript
// webpack.config.js
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true, // 清理旧文件
  },
};
```

### 多入口配置

```javascript
module.exports = {
  entry: {
    main: './src/index.js',
    admin: './src/admin.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
  },
};
```

## Loader 配置

### 处理 CSS

```bash
npm install css-loader style-loader mini-css-extract-plugin -D
npm install sass sass-loader -D
npm install postcss postcss-loader autoprefixer -D
```

```javascript
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  module: {
    rules: [
      // CSS
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
        ],
      },
      // SCSS
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
      // CSS Modules
      {
        test: /\.module\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[name]__[local]--[hash:base64:5]',
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css',
    }),
  ],
};
```

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('autoprefixer'),
  ],
};
```

### 处理 JavaScript

```bash
npm install babel-loader @babel/core @babel/preset-env -D
npm install @babel/preset-react @babel/preset-typescript -D
```

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: '> 0.25%, not dead' }],
              ['@babel/preset-react', { runtime: 'automatic' }],
              '@babel/preset-typescript',
            ],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
};
```

### 处理资源文件

```javascript
module.exports = {
  module: {
    rules: [
      // 图片
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024, // 8KB 以下内联
          },
        },
        generator: {
          filename: 'images/[name].[hash:8][ext]',
        },
      },
      // 字体
      {
        test: /\.(woff2?|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
```

## Plugin 配置

### 常用插件

```bash
npm install html-webpack-plugin copy-webpack-plugin -D
npm install webpack-bundle-analyzer -D
```

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  plugins: [
    // 生成 HTML
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      inject: 'body',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
      },
    }),
    
    // 复制静态资源
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public', to: '', globOptions: { ignore: ['**/index.html'] } },
      ],
    }),
    
    // 打包分析
    process.env.ANALYZE && new BundleAnalyzerPlugin(),
  ].filter(Boolean),
};
```

### 环境变量

```bash
npm install dotenv-webpack -D
```

```javascript
const Dotenv = require('dotenv-webpack');
const webpack = require('webpack');

module.exports = {
  plugins: [
    new Dotenv(),
    // 或使用 DefinePlugin
    new webpack.DefinePlugin({
      'process.env.API_URL': JSON.stringify(process.env.API_URL),
    }),
  ],
};
```

## 开发服务器

```javascript
module.exports = {
  devServer: {
    port: 3000,
    open: true,
    hot: true,
    historyApiFallback: true, // SPA 路由
    
    // 代理
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        pathRewrite: { '^/api': '' },
      },
    },
    
    // 静态资源
    static: {
      directory: path.join(__dirname, 'public'),
    },
  },
};
```

## 优化配置

### 代码分割

```javascript
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // 第三方库
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          chunks: 'initial',
        },
        // React 相关
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          priority: 20,
        },
        // 公共模块
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    },
    
    // 运行时代码
    runtimeChunk: 'single',
  },
};
```

### 压缩

```bash
npm install terser-webpack-plugin css-minimizer-webpack-plugin -D
```

```javascript
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
        },
      }),
      new CssMinimizerPlugin(),
    ],
  },
};
```

### 缓存

```javascript
module.exports = {
  output: {
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].chunk.js',
  },
  
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename],
    },
  },
};
```

### Tree Shaking

```javascript
// package.json
{
  "sideEffects": false,
  // 或指定有副作用的文件
  "sideEffects": [
    "*.css",
    "*.scss"
  ]
}
```

```javascript
module.exports = {
  mode: 'production', // 自动启用 Tree Shaking
  optimization: {
    usedExports: true,
  },
};
```

## 完整配置示例

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const isDev = process.env.NODE_ENV !== 'production';

module.exports = {
  mode: isDev ? 'development' : 'production',
  devtool: isDev ? 'eval-cheap-module-source-map' : 'source-map',
  
  entry: './src/index.tsx',
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isDev ? '[name].js' : '[name].[contenthash].js',
    chunkFilename: isDev ? '[name].chunk.js' : '[name].[contenthash].chunk.js',
    clean: true,
    publicPath: '/',
  },
  
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: [
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: { maxSize: 8 * 1024 },
        },
      },
    ],
  },
  
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    !isDev && new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css',
    }),
  ].filter(Boolean),
  
  optimization: {
    minimize: !isDev,
    minimizer: [
      new TerserPlugin(),
      new CssMinimizerPlugin(),
    ],
    splitChunks: {
      chunks: 'all',
    },
    runtimeChunk: 'single',
  },
  
  devServer: {
    port: 3000,
    hot: true,
    historyApiFallback: true,
  },
  
  cache: {
    type: 'filesystem',
  },
};
```

## 常见问题

### 路径别名 + TypeScript

```javascript
// webpack.config.js
resolve: {
  alias: {
    '@': path.resolve(__dirname, 'src'),
  },
}
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### 多环境配置

```javascript
// webpack.common.js
// webpack.dev.js
// webpack.prod.js

const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',
});
```

```json
{
  "scripts": {
    "dev": "webpack serve --config webpack.dev.js",
    "build": "webpack --config webpack.prod.js"
  }
}
```

## Webpack vs Vite

| 特性 | Webpack | Vite |
|------|---------|------|
| 开发启动 | 慢（需打包） | 快（ESM） |
| 热更新 | 较慢 | 极快 |
| 配置 | 复杂 | 简单 |
| 生态 | 成熟丰富 | 快速发展 |
| 适用场景 | 复杂项目 | 新项目 |

## 总结

| 配置项 | 说明 |
|--------|------|
| entry/output | 入口和输出 |
| module.rules | Loader 配置 |
| plugins | 插件扩展 |
| resolve | 模块解析 |
| optimization | 优化配置 |
| devServer | 开发服务器 |
| cache | 构建缓存 |
