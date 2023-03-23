<template>
  <div class="api-test-excel">
    <div class="top-action-box">
      <ElButton type="primary" @click="exportData">导出</ElButton>
      <ElUpload accept="xlsx" :beforeUpload="beforeUpload">
        <template #trigger>
          <ElButton type="primary">导入</ElButton>
        </template>
      </ElUpload>
      <ElButton type="primary" @click="clear">清空</ElButton>
      <ElButton type="primary" @click="testData">测试</ElButton>
      <ElButton type="primary" @click="configVisible = true">配置</ElButton>
    </div>
    <ElTabs v-model="tabName" type="card" editable @edit="onTabsEdit">
      <ElTabPane v-for="pane in tabList" :label="pane.name" :name="pane.name">
        <ApiTestList v-if="tabName === pane.name" :dataList="pane.dataList" :tabList="tabList" :currentTab="pane.name" />
      </ElTabPane>
    </ElTabs>
    <CustomDialog title="配置" v-model="configVisible" :onConfirm="configConfirm">
      <Config v-if="configVisible" ref="configRef" :runSheets="runSheets" @updateSheet="updateSheet" />
    </CustomDialog>
  </div>
</template>
<script lang="ts" setup>
import { provide, ref } from 'vue';
import { ApiTestExcel, ApiTestExcelPane, ApiTestRequestDataFormat } from '../../types';
import * as XLSX from 'xlsx';
import ApiTestList from './components/ApiTestList.vue';
import { getId, pyDateFmt } from '../../utils';
import { ElMessage, ElMessageBox, TabPaneName } from 'element-plus';
import 'element-plus/es/components/message-box/style/css';
import { testInterface } from '../../utils/executeTest';
import CustomDialog from './components/CustomDialog.vue';
import Config from './components/Config.vue';

const storeTabListStr = sessionStorage.getItem('tabList');
let storeTabList = [
  {
    name: 'sheet',
    dataList: [],
  },
]
if (storeTabListStr) {
  try {
    const tempList = JSON.parse(storeTabListStr);
    if (tempList.length > 0) {
      storeTabList = tempList;
    }
  } catch (error) {

  }
}
const tabList = ref<ApiTestExcelPane[]>(storeTabList);
const runSheetStr = sessionStorage.getItem('api_test_interface_runSheets') || '[]';
let _runSheets: string[] = [];
if (runSheetStr) {
  try {
    _runSheets = JSON.parse(runSheetStr)
  } catch (error) { }
}
const runSheets = ref<string[]>(_runSheets);
const updateSheet = (val: string[]) => {
  runSheets.value = val;
}

const tabName = ref(storeTabList[0].name);

const clear = () => {
  tabList.value = [
    {
      name: 'sheet',
      dataList: [],
    },
  ];
  tabName.value = 'sheet';
  sessionStorage.removeItem('tabList')
}
const configVisible = ref(false);
const configRef = ref<InstanceType<typeof Config>>();
const configConfirm = () => {
  configRef.value?.onSubmit();
  return Promise.resolve();
}
const testData = () => {
  const runSheetTabs = runSheets.value.map(el => tabList.value.find(item => item.name === el) as ApiTestExcelPane | undefined)
  testInterface(runSheetTabs.filter(el => el) as ApiTestExcelPane[]);
}

const keyList: (keyof ApiTestExcel)[] = [
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
  'ActualDataFormat',
  'delay',
  'headers',
  'globalHeaders',
  'zmip',
];
const colKeyMap = keyList.reduce<{ [key in keyof ApiTestExcel]?: string }>(
  (o, el, i) => {
    o[el] = String.fromCharCode(65 + i);
    return o;
  },
  {}
);

const sheets = ref<string[]>();
provide('currentTab', tabName);
provide('tabList', tabList);

const beforeUpload = (file: any) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const wb = XLSX.read(e.target?.result, { type: 'binary' });
    sheets.value = wb.SheetNames;
    const sheetList = wb.SheetNames.reduce((list, sheetname) => {
      if (sheetname === 'init') return list;
      const ws = wb.Sheets[sheetname];
      const lines = +(ws['!ref']?.split(':')[1].replace(/[^\d]/g, '') || '0');
      const data: ApiTestExcel[] = [];
      for (let i = 1; i < lines; i++) {
        const o: { [key: string]: any } = {};
        keyList.forEach((key) => {
          o[key] = ws[`${colKeyMap[key]}${i + 1}`]?.v ?? '';
          if (
            [
              'sql',
              'data',
              'FormData',
              'headers',
              'RequestDataFormat',
              'ActualDataFormat',
              'globalHeaders',
            ].includes(key)
          ) {
            o[key] = o[key].replace(/'/g, '"');
          }
        });
        o._id = getId();
        data.push(o as ApiTestExcel);
      }
      data.forEach((el) => {
        if (el.RequestDataFormat) {
          try {
            const temp = JSON.parse(el.RequestDataFormat);
            temp.forEach((item: ApiTestRequestDataFormat) => {
              const tempSheetName = item.sheetName ?? sheetname;
              const pane = list.find(el => el.name === tempSheetName);
              const dataList = pane?.dataList ?? data;
              if (typeof item.row !== 'undefined' && dataList?.length) {
                item.rowId = dataList[item.row - 1]._id;
              }
            });
            el.RequestDataFormat = JSON.stringify(temp);
          } catch (error) { }
        }
      });
      list.push({
        name: sheetname,
        dataList: data,
      });
      return list;
    }, [] as ApiTestExcelPane[]);
    if (sheetList.length) {
      tabList.value = sheetList;
      tabName.value = tabList.value[0].name;
    }
  };
  reader.readAsBinaryString(file);
  return false;
};

const exportData = () => {
  const sheetData = tabList.value.reduce(
    (sheets: { [key: string]: any }, tab) => {
      let sheet = keyList.reduce((o: { [key: string]: any }, key) => {
        o[`${colKeyMap[key]}1`] = { v: key, w: key, h: key, t: 's' };
        return o;
      }, {});
      sheet['!ref'] = `A1:${String.fromCharCode(65 + keyList.length - 1)}${tab.dataList.length + 2}`;
      sheets[tab.name] = tab.dataList.reduce(
        (o: { [key: string]: any }, el, i) => {
          keyList.forEach((key) => {
            let val = el[key];
            if (['RequestDataFormat', 'globalHeaders'].includes(key) && val === '[]') {
              val = '';
            }
            if (['headers'].includes(key) && val === '{}') {
              val = '';
            }
            const temp: { [key: string]: any } = {
              v: val,
              w: val,
              t: typeof val === 'number' ? 'n' : 's',
            };
            if (typeof val !== 'number') {
              temp.h = val;
            }
            o[`${colKeyMap[key]}${i + 2}`] = temp;
          });
          return o;
        },
        sheet
      );
      sheets[tab.name] = sheet;
      return sheets;
    },
    {}
  );

  XLSX.writeFile(
    {
      SheetNames: tabList.value.map((tab) => tab.name),
      Sheets: sheetData,
    },
    `用例_${Date.now()}.xlsx`
  );
};

const onTabsEdit = (targetName: TabPaneName | undefined, action: 'remove' | 'add') => {
  if (action === 'add') {
    ElMessageBox.prompt('', '添加sheet', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    }).then(({ value }) => {
      if (tabList.value.find(el => el.name === value)) {
        ElMessage.error('sheet已存在');
        return;
      }
      tabList.value.push({
        name: value,
        dataList: [],
      });
    }).catch(() => { });
  } else if (action === 'remove') {
    ElMessageBox.confirm('是否确定删除sheet', '删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      tabList.value = tabList.value.filter((tab) => tab.name !== targetName);
      runSheets.value = runSheets.value.filter(el => el !== targetName);
    }).catch(() => { });
  }
};
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
