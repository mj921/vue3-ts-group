<template>
  <div class="api-test-excel">
    <div class="top-action-box">
      <ElButton type="primary" @click="exportData">导出</ElButton>
      <ElUpload accept="xlsx" :beforeUpload="beforeUpload">
        <template #trigger>
          <ElButton type="primary">导入</ElButton>
        </template>
      </ElUpload>
    </div>
    <ElTabs type="card">
      <ElTabPane v-for="pane in tabList" :label="pane.name">
        <ApiTestList :dataList="pane.dataList" />
      </ElTabPane>
    </ElTabs>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { ApiTestExcel, ApiTestExcelPane, ApiTestRequestDataFormatRequest } from '.';
import * as XLSX from 'xlsx';
import ApiTestList from './components/ApiTestList.vue';
import { getId } from '../../utils';

const tabList = ref<ApiTestExcelPane[]>([{
  name: 'sheet',
  dataList: []
}]);

const keyList: (keyof ApiTestExcel)[]  = [
  'id',
  'method',
  'module',
  'url',
  'data',
  'sql',
  'Expected_code',
  'Actual_code',
  'sql_result',
  'Result',
  'Reason',
  'FormData',
  'RequestDataFormat',
  'total',
  'delay',
];
const colKeyMap = keyList.reduce<{ [key in keyof ApiTestExcel]?: string; }>((o, el, i) => {
  o[el] = String.fromCharCode(65 + i);
  return o;
}, {})

const sheets = ref<string[]>();

const beforeUpload = (file: any) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const wb = XLSX.read(e.target?.result, { type: 'binary' });
    sheets.value = wb.SheetNames;
    tabList.value = wb.SheetNames.reduce((list, sheetname) => {
      if (sheetname === 'init') return list;
      const ws = wb.Sheets[sheetname];
      const lines = +(ws['!ref']?.split(':')[1].replace(/[^\d]/g, '') || '0');
      const data: ApiTestExcel[] = []
      for (let i = 1; i < lines; i++) {
        const o: { [key: string]: any } = {};
        keyList.forEach(key => {
          o[key] = ws[`${colKeyMap[key]}${i + 1}`]?.v || '';
          if (['sql', 'data', 'FormData', 'headers', 'RequestDataFormat'].includes(key)) {
            o[key] = o[key].replace(/'/g, '"');
          }
        })
        o._id = getId();
        data.push(o as ApiTestExcel);
      }
      data.forEach(el => {
        if (el.RequestDataFormat) {
          try {
            const temp = JSON.parse(el.RequestDataFormat);
            temp.forEach((item: ApiTestRequestDataFormatRequest) => {
              if (typeof item.row !== 'undefined') {
                item.rowId = data[item.row - 1]._id;
              }
            })
            el.RequestDataFormat = JSON.stringify(temp);
          } catch (error) {}
        }
      })
      list.push({
        name: sheetname,
        dataList: data
      })
      return list;
    }, [] as ApiTestExcelPane[])
    
  };
  reader.readAsBinaryString(file);
  return false;
};

const exportData = () => {
  const sheetData = tabList.value.reduce((sheets: {[key: string]: any}, tab) => {
    let sheet = keyList.reduce((o: {[key: string]: any}, key) => {
      o[`${colKeyMap[key]}1`] = { v: key, w: key, h: key, t: 's' };
      return o;
    }, {});
    sheet['!ref'] = `A1:O${tab.dataList.length + 2}`;
    sheets[tab.name] = tab.dataList.reduce((o: {[key: string]: any}, el, i) => {
      keyList.forEach((key) => {
        const temp: {[key: string]: any} = { v: el[key], w: el[key], t: typeof el[key] === 'number' ? 'n' : 's' }
        if (typeof el[key] !== 'number') {
          temp.h = el[key];
        }
        o[`${colKeyMap[key]}${i + 2}`] = temp;
      }) 
      return o;
    }, sheet);
    sheets[tab.name] = sheet;
    return sheets;
  }, {});
  
  XLSX.writeFile({
    SheetNames: tabList.value.map(tab => tab.name),
    Sheets: sheetData,
  }, `用例_${Date.now()}.xlsx`)
}
</script>
<style scoped lang="scss">
.api-test-excel {
  padding: 20px;
  .top-action-box {
    margin-bottom: 16px;
    display: flex;
    .el-button {
      margin-right: 8px;
    }
  }
}
</style>
