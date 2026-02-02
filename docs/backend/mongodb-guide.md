# MongoDB 入门指南

MongoDB 是最流行的 NoSQL 文档数据库，适合存储灵活的 JSON 结构数据。

## 核心概念

| SQL 概念 | MongoDB 概念 |
|----------|--------------|
| Database | Database |
| Table | Collection |
| Row | Document |
| Column | Field |
| Primary Key | _id |

## 安装与连接

### Docker 安装

```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:7
```

### Node.js 连接

```bash
npm install mongodb
```

```javascript
const { MongoClient } = require('mongodb');

const uri = 'mongodb://root:password@localhost:27017';
const client = new MongoClient(uri);

async function main() {
  await client.connect();
  console.log('Connected to MongoDB');
  
  const db = client.db('mydb');
  const users = db.collection('users');
  
  // 操作...
  
  await client.close();
}

main().catch(console.error);
```

## CRUD 操作

### 插入文档

```javascript
const users = db.collection('users');

// 插入单个
const result = await users.insertOne({
  name: 'Tom',
  age: 25,
  email: 'tom@example.com',
  createdAt: new Date(),
});
console.log(result.insertedId);

// 插入多个
const result = await users.insertMany([
  { name: 'Jerry', age: 22 },
  { name: 'Spike', age: 30 },
]);
console.log(result.insertedIds);
```

### 查询文档

```javascript
// 查询单个
const user = await users.findOne({ name: 'Tom' });

// 查询多个
const cursor = users.find({ age: { $gte: 18 } });
const userList = await cursor.toArray();

// 遍历游标
await cursor.forEach(doc => console.log(doc));

// 查询条件
users.find({
  age: { $gte: 18, $lte: 30 },  // 18 <= age <= 30
  name: { $in: ['Tom', 'Jerry'] },
  email: { $exists: true },
  status: { $ne: 'deleted' },
});

// 投影（选择字段）
users.find({}, { projection: { name: 1, email: 1, _id: 0 } });

// 排序
users.find().sort({ createdAt: -1 });

// 分页
users.find().skip(20).limit(10);

// 计数
const count = await users.countDocuments({ age: { $gte: 18 } });
```

### 更新文档

```javascript
// 更新单个
const result = await users.updateOne(
  { name: 'Tom' },
  { $set: { age: 26 } }
);

// 更新多个
await users.updateMany(
  { status: 'pending' },
  { $set: { status: 'active' } }
);

// 替换文档
await users.replaceOne(
  { name: 'Tom' },
  { name: 'Tom', age: 26, role: 'admin' }
);

// 更新操作符
users.updateOne({ _id }, {
  $set: { name: 'Tom' },       // 设置字段
  $unset: { temp: '' },        // 删除字段
  $inc: { count: 1 },          // 增加数值
  $push: { tags: 'new' },      // 数组添加元素
  $pull: { tags: 'old' },      // 数组删除元素
  $addToSet: { tags: 'unique' }, // 数组添加（去重）
});

// upsert - 不存在则插入
await users.updateOne(
  { email: 'new@example.com' },
  { $set: { name: 'New User' } },
  { upsert: true }
);
```

### 删除文档

```javascript
// 删除单个
await users.deleteOne({ name: 'Tom' });

// 删除多个
await users.deleteMany({ status: 'deleted' });

// 删除所有
await users.deleteMany({});
```

## 查询操作符

### 比较操作符

```javascript
{ age: { $eq: 25 } }    // 等于
{ age: { $ne: 25 } }    // 不等于
{ age: { $gt: 25 } }    // 大于
{ age: { $gte: 25 } }   // 大于等于
{ age: { $lt: 25 } }    // 小于
{ age: { $lte: 25 } }   // 小于等于
{ age: { $in: [20, 25, 30] } }     // 在数组中
{ age: { $nin: [20, 25, 30] } }    // 不在数组中
```

### 逻辑操作符

```javascript
// AND（隐式）
{ name: 'Tom', age: 25 }

// AND（显式）
{ $and: [{ name: 'Tom' }, { age: 25 }] }

// OR
{ $or: [{ name: 'Tom' }, { name: 'Jerry' }] }

// NOT
{ age: { $not: { $gt: 25 } } }

// NOR
{ $nor: [{ name: 'Tom' }, { name: 'Jerry' }] }
```

### 元素操作符

```javascript
{ email: { $exists: true } }   // 字段存在
{ age: { $type: 'number' } }   // 字段类型
```

### 数组操作符

```javascript
{ tags: 'javascript' }                    // 数组包含元素
{ tags: { $all: ['js', 'node'] } }        // 包含所有元素
{ tags: { $size: 3 } }                    // 数组长度
{ 'tags.0': 'first' }                     // 数组索引
{ scores: { $elemMatch: { $gte: 80 } } }  // 元素匹配条件
```

### 正则表达式

```javascript
{ name: /^Tom/i }                    // 以 Tom 开头（不区分大小写）
{ name: { $regex: '^Tom', $options: 'i' } }
```

## 聚合管道

```javascript
const result = await users.aggregate([
  // 匹配
  { $match: { status: 'active' } },
  
  // 分组
  { $group: {
    _id: '$department',
    count: { $sum: 1 },
    avgAge: { $avg: '$age' },
    names: { $push: '$name' },
  }},
  
  // 排序
  { $sort: { count: -1 } },
  
  // 限制
  { $limit: 10 },
  
  // 投影
  { $project: {
    department: '$_id',
    count: 1,
    avgAge: { $round: ['$avgAge', 1] },
  }},
]).toArray();
```

### 常用聚合阶段

```javascript
// $lookup - 关联查询
{ $lookup: {
  from: 'orders',
  localField: '_id',
  foreignField: 'userId',
  as: 'orders',
}}

// $unwind - 展开数组
{ $unwind: '$tags' }

// $addFields - 添加字段
{ $addFields: {
  fullName: { $concat: ['$firstName', ' ', '$lastName'] },
}}

// $facet - 多管道
{ $facet: {
  total: [{ $count: 'count' }],
  data: [{ $skip: 0 }, { $limit: 10 }],
}}
```

## 索引

### 创建索引

```javascript
// 单字段索引
await users.createIndex({ email: 1 });

// 复合索引
await users.createIndex({ name: 1, age: -1 });

// 唯一索引
await users.createIndex({ email: 1 }, { unique: true });

// 稀疏索引（忽略空值）
await users.createIndex({ email: 1 }, { sparse: true });

// TTL 索引（自动过期）
await users.createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 });

// 文本索引
await users.createIndex({ content: 'text' });
```

### 查看索引

```javascript
const indexes = await users.indexes();
console.log(indexes);
```

## Mongoose (ODM)

### 安装

```bash
npm install mongoose
```

### 连接

```javascript
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/mydb');

mongoose.connection.on('connected', () => {
  console.log('Mongoose connected');
});
```

### 定义 Schema

```javascript
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 2,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
  },
  age: {
    type: Number,
    min: 0,
    max: 150,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  tags: [String],
  profile: {
    avatar: String,
    bio: String,
  },
}, {
  timestamps: true,  // createdAt, updatedAt
});

// 虚拟字段
userSchema.virtual('isAdult').get(function() {
  return this.age >= 18;
});

// 实例方法
userSchema.methods.getPublicProfile = function() {
  return { name: this.name, email: this.email };
};

// 静态方法
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email });
};

// 中间件
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = mongoose.model('User', userSchema);
```

### CRUD 操作

```javascript
// 创建
const user = new User({ name: 'Tom', email: 'tom@example.com' });
await user.save();

// 或
const user = await User.create({ name: 'Tom', email: 'tom@example.com' });

// 查询
const user = await User.findById(id);
const user = await User.findOne({ email: 'tom@example.com' });
const users = await User.find({ age: { $gte: 18 } });

// 更新
await User.findByIdAndUpdate(id, { name: 'New Name' }, { new: true });
await User.updateMany({ role: 'user' }, { $set: { active: true } });

// 删除
await User.findByIdAndDelete(id);
await User.deleteMany({ status: 'deleted' });
```

## 最佳实践

1. **使用索引** - 为查询字段创建索引
2. **限制返回字段** - 只返回需要的字段
3. **分页查询** - 避免返回大量数据
4. **使用聚合** - 复杂查询用聚合管道
5. **连接池** - 复用数据库连接
6. **Schema 验证** - 使用 Mongoose 或 JSON Schema

## 总结

| 操作 | 方法 |
|------|------|
| 插入 | `insertOne` / `insertMany` |
| 查询 | `find` / `findOne` |
| 更新 | `updateOne` / `updateMany` |
| 删除 | `deleteOne` / `deleteMany` |
| 聚合 | `aggregate` |
| 索引 | `createIndex` |
