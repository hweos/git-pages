---
sidebar_position: 1
slug: indexed-priority-queue
title: 索引优先队列
---

# 索引优先队列

<center>创建时间：2021年12月18日 10:30</center>



索引优先队列是不改变数据的插入顺序，也就是不直接在插入的数组 `items` 中直接进行堆排序，而是专门用一个数组 `pq` 来保存堆排序，而 `pq` 数组里面保存的值是 `items` 数组里面对应值的下标。在进行堆排序的过程中都是直接操作 `pq` 数组。由于在插入或者修改等一些操作的时候都是传入的是插入时的下标，也就是 `items` 的下标，我们并不能方便得到下标所对应值在堆中的位置，即便我们 `pq` 数组保存了，每次找都需要遍历 `pq` 数组，为了方便起见，我们再新增一个数组 `qp` ，这个数组是保存插入值在 `pq` 数组中的位置，也就是 `pq[qp[k]]` 等于 `k` 元素在堆中的位置。

```java
public class IndexMinPQ<Item extends Comparable<Item>> {

    Item[] items; // 保存真正的顺序，里面的值不能发生改变，保持插入顺序
    int[] pq; // 保存堆的顺序
    int[] qp; // 根据插入位置找到 pq 中保存的值 pq[qp[key]] 代表k元素对应堆中的位置
    int n;
    int maxN;

    IndexMinPQ(int maxN) {
        if (maxN < 0) throw new IllegalArgumentException();
        items = (Item[]) new Comparable[maxN + 1];
        pq = new int[maxN + 1];
        qp = new int[maxN + 1];
        // 初始化数据都为 -1
        Arrays.fill(qp, -1);
        n = 0;
        this.maxN = maxN;
    }
    void insert(int k, Item item) {
        validateIndex(k);
        // 插入元素不能插入到不存在的位置中
        if (contains(k)) throw new IllegalArgumentException();
        // 维护长度 n
        n ++;
        // 直接赋值
        items[k] = item;
        // 对应 qp 来说，是根据 k 来保存 pq 的值
        qp[k] = n;
        // pq 才是按堆顺序，刚插入的时候直接放到最后
        pq[n] = k;
        // 然后进行冒泡操作，也就是上浮
        swim(n);
    }
    void change(int k, Item item) {
        validateIndex(k);
        // 改变值，如果原本不存在这样的值，那么就直接抛出异常
        // 也就是不能修改一个不存在的值
        if (!contains(k)) throw new IllegalArgumentException();
        // 如果这个值存在的话，直接修改
        items[k] = item;
        // 得到要修改这个位置在堆中的位置
        int i = qp[k];
        // 由于修改的值我们并不清楚是下沉还是上浮，所以都需要进行
        swim(i);
        sink(i);
    }
    boolean contains(int k) {
        validateIndex(k);
        return qp[k] != -1;
    }
    void delete(int k) {
        validateIndex(k);
        /*
          这个跟 delMin 不同的是指定了下标，
          这里传进来的下标是数组的下标，并不是 pq 数组中的
          下标，所以删除的时候直接置为 null 即可，不需要
          经过 pq 转换一次，但对应交换来说，由于我们是交换
          pq 数组中的元素，所以需要使用 qp 数组来获取对应 pq
          数组的位置，然后再跟最后一个元素交换
         */
        items[k] = null;
        swapPQ(qp[k], n);
        // 维护为"空"
        qp[pq[n]] = -1;
        pq[n] = 0;
        // 维护长度
        n--;
        /*
         删除以后需要进行下沉操作，跟 delMin 相同，
         delMin 中是特殊的 delete 操作，相当于调用了
         delete(pq[1]) 。
         */
        sink(pq[k]);
    }
    Item min() {
        if (n == 0) throw new NoSuchElementException("Priority queue underflow");
        return items[pq[1]];
    }
    int minIndex() {
        if (n == 0) throw new NoSuchElementException("Priority queue underflow");
        return pq[1];
    }
    int delMin() {
        // 拿到要删除的下标
        int delIndex = minIndex();
        // 将要删除的位置置为 null
        // 由于是最小值，所以对应的是 pq 数组中的下标为 1 的那个
        // 对应的 items 中的值。pq 是从下标 1 开始计算的
        items[pq[1]] = null;
        // 交换最后一个元素和第一个元素
        swapPQ(1, n);
        // 将对应的数据都设置成"空"
        qp[pq[n]] = -1;
        pq[n] = 0;
        // 维护 n 的值
        n--;
        // 由于删除的是堆中的第一个元素，所以需要进行下沉操作
        sink(1);
        return delIndex;
    }
    boolean isEmpty() {
        return n == 0;
    }
    int size() {
        return n;
    }

    /**
     * 冒泡，也就是上浮，默认其他节点都排好序了
     * @param k 也做上浮的节点， pq 数组中的下标
     */
    void swim(int k) {
        // 如果大于 1 并且比父节点小才进行交换
        while (k > 1 && less(k, k/2)) {
            swapPQ(k, k/2);
            k /= 2;
        }
    }

    /**
     * 堆下沉
     * @param k 要下沉的下标，这里的下标是数组 pq 中的下标
     */
    void sink(int k) {
        while (k <= n) {
            int min = k;
            // 用当前节点跟两个孩子节点作比较，选出三个中最小的那个
            if (2 * k <= n && less(k * 2, min)) {
                min = 2 * k;
            }
            if (2 * k + 1 < n && less(k * 2 + 1, min)) {
                min = 2 * k + 1;
            }
            // 如果最小的就交换
            if (k != min) {
                swapPQ(k, min);
                k = min;
                continue;
            }
            break;
        }
    }

    /**
     * 比较 pq 数组中对应位置所对应的 items 里面的值
     * @param i pq 数组中的下标
     * @param j pq 数组中的下标
     * @return 所对应的 items 里面的值的比较结果是否是小于
     */
    boolean less(int i, int j) {
        return items[pq[i]].compareTo(items[pq[j]]) < 0;
    }

    /**
     * 交换 pq 数组中的位置
     * @param i pq 数组中一个下标
     * @param j pq 数组中另一个下标
     */
    void swapPQ(int i, int j) {
        int temp = pq[i];
        pq[i] = pq[j];
        pq[j] = temp;
        // 对于 qp 来说就是以值作为下标，以 pq 的下标作为值
        qp[pq[i]] = i;
        qp[pq[j]] = j;
    }

    private void validateIndex(int i) {
        if (i < 0) throw new IllegalArgumentException("index is negative: " + i);
        if (i >= maxN) throw new IllegalArgumentException("index >= capacity: " + i);
    }
}

```

