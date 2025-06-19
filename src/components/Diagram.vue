<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { getCategoryPie, getMonthlyTrend } from "@/apis/index.js";
import { ElMessage } from "element-plus";

// 表单数据
const form1 = ref({
  startDate: '',
  endDate: '',
  type: '0'
})
const form2 = ref({
  year: new Date().getFullYear().toString(),
  type: '0'
})
const form3 = ref({
  startDate: '',
  endDate: '',
  type: '1'
})
const form4 = ref({
  year: new Date().getFullYear().toString(),
  type: '1'
})

// 图表数据
const chart1Data = ref({ categoryName: [], amount: [], ratio: [] }) // 支出分类
const chart2Data = ref({ month: [], amount: [] }) // 月度支出
const chart3Data = ref({ categoryName: [], amount: [], ratio: [] }) // 收入分类
const chart4Data = ref({ month: [], amount: [] }) // 月度收入

// 图表实例
const chart1 = ref(null)
const chart2 = ref(null)
const chart3 = ref(null)
const chart4 = ref(null)

// 日期验证状态
const dateRangeValid = ref(true)
const dateRangeValid3 = ref(true)

const validateDateRange = (form, validRef) => {
  if (form.value.startDate && form.value.endDate) {
    const start = new Date(form.value.startDate)
    const end = new Date(form.value.endDate)
    const isValid = start <= end
    validRef.value = isValid
    if (!isValid) {
      ElMessage.warning('开始日期不能大于结束日期')
    }
    return isValid
  }
  return false
}

// 获取数据
const fetchData = async () => {
  try {
    const [res1, res2, res3, res4] = await Promise.all([
      getCategoryPie(form1.value), // 支出分类
      getMonthlyTrend(form2.value), // 月度支出
      getCategoryPie(form3.value), // 收入分类
      getMonthlyTrend(form4.value) // 月度收入
    ])
    chart1Data.value = res1.data
    chart2Data.value = res2.data
    chart3Data.value = res3.data
    chart4Data.value = res4.data
    updateCharts()
    ElMessage.success({duration: 1000, grouping: true, message: '更新成功'})
  } catch (err) {
    ElMessage.error(err || '获取数据失败')
    console.error(err)
  }
}

// 初始化图表
const initCharts = () => {
  chart1.value = echarts.init(document.getElementById('chart1'))
  chart2.value = echarts.init(document.getElementById('chart2'))
  chart3.value = echarts.init(document.getElementById('chart3'))
  chart4.value = echarts.init(document.getElementById('chart4'))
  updateCharts()
}

// 更新图表
const updateCharts = () => {
  // 支出分类环形图
  chart1.value.setOption({
    title: { text: '支出分类统计', left: 'center' },
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: ¥{c} ({d}%)' },
    legend: { orient: 'vertical', left: 'left', data: chart1Data.value.categoryName },
    series: [{
      name: '支出金额',
      type: 'pie',
      radius: ['50%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false, position: 'center' },
      emphasis: { label: { show: true, fontSize: '18', fontWeight: 'bold' } },
      labelLine: { show: false },
      data: chart1Data.value.categoryName.map((name, index) => ({
        value: chart1Data.value.amount[index], name
      }))
    }]
  })
  // 月度支出趋势
  chart2.value.setOption({
    title: { text: '月度支出趋势', left: 'center' },
    tooltip: { trigger: 'item', axisPointer: { type: 'shadow' }, formatter: '{b}<br/>支出: ¥{c}' },
    xAxis: { type: 'category', data: chart2Data.value.month },
    yAxis: { type: 'value' },
    series: [{
      name: '支出金额',
      type: 'bar',
      data: chart2Data.value.amount,
      itemStyle: { color: '#f56c6c' },
      showBackground: true,
      backgroundStyle: { color: 'rgba(180, 180, 180, 0.2)' }
    }]
  })
  // 收入分类环形图
  chart3.value.setOption({
    title: { text: '收入分类统计', left: 'center' },
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: ¥{c} ({d}%)' },
    legend: { orient: 'vertical', left: 'left', data: chart3Data.value.categoryName },
    series: [{
      name: '收入金额',
      type: 'pie',
      radius: ['50%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false, position: 'center' },
      emphasis: { label: { show: true, fontSize: '18', fontWeight: 'bold' } },
      labelLine: { show: false },
      data: chart3Data.value.categoryName.map((name, index) => ({
        value: chart3Data.value.amount[index], name
      }))
    }]
  })
  // 月度收入趋势
  chart4.value.setOption({
    title: { text: '月度收入趋势', left: 'center' },
    tooltip: { trigger: 'item', axisPointer: { type: 'shadow' }, formatter: '{b}<br/>收入: ¥{c}' },
    xAxis: { type: 'category', data: chart4Data.value.month },
    yAxis: { type: 'value' },
    series: [{
      name: '收入金额',
      type: 'bar',
      data: chart4Data.value.amount,
      itemStyle: { color: '#67c23a' },
      showBackground: true,
      backgroundStyle: { color: 'rgba(180, 180, 180, 0.2)' }
    }]
  })
}

// 监听窗口大小变化
const handleResize = () => {
  chart1.value?.resize()
  chart2.value?.resize()
  chart3.value?.resize()
  chart4.value?.resize()
}

onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
  fetchData()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 监听表单变化，重新获取数据
watch(
    [
      () => form1.value.startDate, () => form1.value.endDate, form2,
      () => form3.value.startDate, () => form3.value.endDate, form4
    ],
    (newVals, oldVals) => {
      // 支出分类和趋势
      if (newVals[0] !== oldVals[0] || newVals[1] !== oldVals[1]) {
        if (validateDateRange(form1, dateRangeValid)) fetchData()
      } else if (JSON.stringify(newVals[2]) !== JSON.stringify(oldVals[2])) {
        fetchData()
      }
      // 收入分类和趋势
      if (newVals[3] !== oldVals[3] || newVals[4] !== oldVals[4]) {
        if (validateDateRange(form3, dateRangeValid3)) fetchData()
      } else if (JSON.stringify(newVals[5]) !== JSON.stringify(oldVals[5])) {
        fetchData()
      }
    },
    { deep: true }
)
</script>

<template>
  <div class="diagram-container">
    <!-- 图表区域 -->
    <div class="chart-section">
      <!-- 第一行：支出环形图+支出趋势 -->
      <div class="chart-row">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <el-form :inline="true" :model="form1" class="filter-form">
              <el-form-item label="时间范围：">
                <el-date-picker
                    v-model="form1.startDate"
                    type="date"
                    placeholder="开始日期"
                    value-format="YYYY-MM-DD"
                    class="filter-input"
                />
                <span class="date-separator">至</span>
                <el-date-picker
                    v-model="form1.endDate"
                    type="date"
                    placeholder="结束日期"
                    value-format="YYYY-MM-DD"
                    class="filter-input"
                />
              </el-form-item>
            </el-form>
          </template>
          <div id="chart1" class="chart-box"></div>
        </el-card>
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <el-form :inline="true" :model="form2" class="filter-form">
              <el-form-item label="时间：">
                <el-date-picker
                    v-model="form2.year"
                    type="year"
                    placeholder="选择年份"
                    value-format="YYYY"
                    class="filter-input"
                />
              </el-form-item>
            </el-form>
          </template>
          <div id="chart2" class="chart-box"></div>
        </el-card>
      </div>
      <!-- 第二行：收入环形图+收入趋势 -->
      <div class="chart-row">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <el-form :inline="true" :model="form3" class="filter-form">
              <el-form-item label="时间范围：">
                <el-date-picker
                    v-model="form3.startDate"
                    type="date"
                    placeholder="开始日期"
                    value-format="YYYY-MM-DD"
                    class="filter-input"
                />
                <span class="date-separator">至</span>
                <el-date-picker
                    v-model="form3.endDate"
                    type="date"
                    placeholder="结束日期"
                    value-format="YYYY-MM-DD"
                    class="filter-input"
                />
              </el-form-item>
            </el-form>
          </template>
          <div id="chart3" class="chart-box"></div>
        </el-card>
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <el-form :inline="true" :model="form4" class="filter-form">
              <el-form-item label="时间：">
                <el-date-picker
                    v-model="form4.year"
                    type="year"
                    placeholder="选择年份"
                    value-format="YYYY"
                    class="filter-input"
                />
              </el-form-item>
            </el-form>
          </template>
          <div id="chart4" class="chart-box"></div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.diagram-container {
  display: flex;
  flex-direction: column;
  height: 95vh;
  padding: 0;
  background-color: #f5f5f5;
}

/* 图表区域样式 */
.chart-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-x: hidden;
  overflow-y: auto;
  margin-bottom: 50px;
}

.chart-row {
  display: flex;
  gap: 8px;
}

.chart-card {
  flex: 1;
  border-radius: 8px;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.chart-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.chart-card.full-width {
  flex: 0 0 100%;
}

.chart-box {
  flex: 1;
  width: 100%;
  min-height: 300px;
}

/* 卡片头部样式 */
.card-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.filter-form {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 0;
}

.filter-input {
  width: 120px;
}

.date-separator {
  margin: 0 8px;
  color: #606266;
}
</style>
