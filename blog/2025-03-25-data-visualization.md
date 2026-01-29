---
slug: data-visualization
title: 数据可视化入门 (ECharts)
authors: mason
tags: [数据可视化, ECharts, 前端]
---

数据可视化让数据更直观易懂。本文介绍 ECharts 的基础使用和常见图表类型。

<!--truncate-->

## 🎯 为什么选择 ECharts

| 特点 | 说明 |
|------|------|
| 丰富的图表 | 20+ 图表类型 |
| 高度定制 | 配置项完善 |
| 交互性强 | 缩放、拖拽、提示 |
| 性能优秀 | Canvas/SVG 渲染 |
| 移动端友好 | 响应式设计 |

---

## 🚀 快速开始

### 安装

```bash
npm install echarts
```

### 基础使用

```tsx
import * as echarts from 'echarts';
import { useEffect, useRef } from 'react';

function Chart() {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);

    const option = {
      title: { text: '销售数据' },
      xAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      },
      yAxis: { type: 'value' },
      series: [
        {
          data: [120, 200, 150, 80, 70],
          type: 'bar',
        },
      ],
    };

    chart.setOption(option);

    // 响应式
    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, []);

  return <div ref={chartRef} style={{ width: '100%', height: 400 }} />;
}
```

---

## 📊 常见图表

### 折线图

```javascript
const option = {
  title: { text: '访问趋势' },
  tooltip: { trigger: 'axis' },
  legend: { data: ['PV', 'UV'] },
  xAxis: {
    type: 'category',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  },
  yAxis: { type: 'value' },
  series: [
    {
      name: 'PV',
      type: 'line',
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      smooth: true,
    },
    {
      name: 'UV',
      type: 'line',
      data: [120, 132, 101, 134, 90, 230, 210],
      smooth: true,
    },
  ],
};
```

### 柱状图

```javascript
const option = {
  title: { text: '季度销售' },
  tooltip: {},
  xAxis: {
    type: 'category',
    data: ['Q1', 'Q2', 'Q3', 'Q4'],
  },
  yAxis: { type: 'value' },
  series: [
    {
      name: '2023',
      type: 'bar',
      data: [500, 800, 600, 900],
      itemStyle: { color: '#3b82f6' },
    },
    {
      name: '2024',
      type: 'bar',
      data: [600, 950, 750, 1100],
      itemStyle: { color: '#10b981' },
    },
  ],
};
```

### 饼图

```javascript
const option = {
  title: {
    text: '流量来源',
    left: 'center',
  },
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)',
  },
  legend: {
    orient: 'vertical',
    left: 'left',
  },
  series: [
    {
      type: 'pie',
      radius: '50%',
      data: [
        { value: 1048, name: '搜索引擎' },
        { value: 735, name: '直接访问' },
        { value: 580, name: '邮件营销' },
        { value: 484, name: '联盟广告' },
        { value: 300, name: '视频广告' },
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
    },
  ],
};
```

### 环形图

```javascript
const option = {
  series: [
    {
      type: 'pie',
      radius: ['40%', '70%'],  // 内外半径
      avoidLabelOverlap: false,
      label: {
        show: false,
        position: 'center',
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 24,
          fontWeight: 'bold',
        },
      },
      labelLine: { show: false },
      data: [
        { value: 1048, name: '搜索引擎' },
        { value: 735, name: '直接访问' },
        { value: 580, name: '邮件营销' },
      ],
    },
  ],
};
```

### 雷达图

```javascript
const option = {
  radar: {
    indicator: [
      { name: '销售', max: 100 },
      { name: '管理', max: 100 },
      { name: '技术', max: 100 },
      { name: '客服', max: 100 },
      { name: '研发', max: 100 },
      { name: '市场', max: 100 },
    ],
  },
  series: [
    {
      type: 'radar',
      data: [
        {
          value: [80, 90, 70, 60, 85, 75],
          name: '团队A',
        },
        {
          value: [60, 70, 80, 90, 65, 85],
          name: '团队B',
        },
      ],
    },
  ],
};
```

---

## 🎨 样式配置

### 主题

```javascript
// 使用内置主题
echarts.init(dom, 'dark');

// 自定义主题
echarts.registerTheme('myTheme', {
  color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
  backgroundColor: '#f8fafc',
});
echarts.init(dom, 'myTheme');
```

### 颜色配置

```javascript
const option = {
  color: ['#5470c6', '#91cc75', '#fac858', '#ee6666'],
  series: [
    {
      type: 'bar',
      itemStyle: {
        color: (params) => {
          const colors = ['#5470c6', '#91cc75', '#fac858'];
          return colors[params.dataIndex % colors.length];
        },
      },
    },
  ],
};
```

### 渐变色

```javascript
const option = {
  series: [
    {
      type: 'bar',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#83bff6' },
          { offset: 0.5, color: '#188df0' },
          { offset: 1, color: '#188df0' },
        ]),
      },
    },
  ],
};
```

---

## 🔧 交互配置

### Tooltip

```javascript
const option = {
  tooltip: {
    trigger: 'axis',  // 'item' | 'axis' | 'none'
    axisPointer: {
      type: 'cross',  // 'line' | 'shadow' | 'cross'
    },
    formatter: (params) => {
      return `${params[0].name}: ${params[0].value}`;
    },
  },
};
```

### Legend

```javascript
const option = {
  legend: {
    type: 'scroll',  // 可滚动
    orient: 'vertical',
    right: 10,
    top: 20,
    bottom: 20,
    data: ['系列1', '系列2', '系列3'],
    selected: {
      '系列1': true,
      '系列2': false,  // 默认不选中
    },
  },
};
```

### 数据缩放

```javascript
const option = {
  dataZoom: [
    {
      type: 'slider',
      show: true,
      start: 0,
      end: 100,
    },
    {
      type: 'inside',  // 鼠标滚轮缩放
      start: 0,
      end: 100,
    },
  ],
};
```

---

## 📱 响应式

```typescript
function useChart(option: any) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts>();

  useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current);
    chartInstance.current.setOption(option);

    const resizeObserver = new ResizeObserver(() => {
      chartInstance.current?.resize();
    });
    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
      chartInstance.current?.dispose();
    };
  }, [option]);

  return { chartRef, chart: chartInstance.current };
}
```

---

## 📦 按需引入

```javascript
// 减小包体积
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  CanvasRenderer,
]);
```

---

## 🔄 动态数据

```typescript
function RealTimeChart() {
  const chartRef = useRef<echarts.ECharts>();
  const [data, setData] = useState<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newValue = Math.random() * 100;
      setData((prev) => [...prev.slice(-19), newValue]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chartRef.current?.setOption({
      series: [{ data }],
    });
  }, [data]);

  return <div ref={bindChart} style={{ height: 400 }} />;
}
```

---

## 📋 推荐资源

- [ECharts 官方文档](https://echarts.apache.org/)
- [ECharts 示例](https://echarts.apache.org/examples/)
- [Make A Pie](https://www.makeapie.cn/) - 社区作品

---

数据可视化的关键是选择正确的图表类型，让数据讲故事。
