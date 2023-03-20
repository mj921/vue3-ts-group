<template>
  <div class="api-test-list">
    <div class="top-action-box">
      <ElButton type="primary" @click="add">添加</ElButton>
    </div>
    <ElTable :data="dataList" border stripe :row-style="rowStyle">
      <ElTableColumn prop="id" label="id" :width="50" fixed="left"></ElTableColumn>
      <ElTableColumn prop="module" label="module" :width="100" fixed="left"></ElTableColumn>
      <ElTableColumn prop="method" label="method" :width="80"></ElTableColumn>
      <ElTableColumn prop="url" label="url" :width="120"></ElTableColumn>
      <ElTableColumn prop="data" label="data" :width="200"></ElTableColumn>
      <ElTableColumn prop="sql" label="sql" :width="160"></ElTableColumn>
      <ElTableColumn prop="Expected_code" label="Expected_code" :width="130">
      </ElTableColumn>
      <ElTableColumn prop="Actual_code" label="Actual_code" :width="110">
      </ElTableColumn>
      <ElTableColumn prop="sql_result" label="sql_result" :width="100">
      </ElTableColumn>
      <ElTableColumn prop="Result" label="Result" :width="70"></ElTableColumn>
      <ElTableColumn prop="Reason" label="Reason" :width="100"></ElTableColumn>
      <ElTableColumn prop="FormData" label="FormData" :width="160">
      </ElTableColumn>
      <ElTableColumn prop="RequestDataFormat" label="RequestDataFormat" :width="200">
      </ElTableColumn>
      <ElTableColumn prop="ActualDataFormat" label="ActualDataFormat" :width="160"></ElTableColumn>
      <ElTableColumn prop="delay" label="delay" :width="70"></ElTableColumn>
      <ElTableColumn prop="headers" label="headers" :width="160">
      </ElTableColumn>
      <ElTableColumn prop="globalHeaders" label="globalHeaders" :width="160">
      </ElTableColumn>
      <ElTableColumn label="操作" :width="200" fixed="right">
        <template v-slot="{ row, $index }">
          <div class="operation-btns">
            <ElButton text type="primary" @click="edit(row)">编辑</ElButton>
            <ElButton text type="primary" @click="copy(row)">复制</ElButton>
            <ElButton text type="danger" @click="deleteRow(row)">删除</ElButton>
            <br />
            <ElButton text type="primary" @click="swrap($index, 'up')" v-if="$index !== 0">上移</ElButton>
            <ElButton text type="primary" @click="swrap($index, 'down')" v-if="$index !== dataList.length - 1">下移
            </ElButton>
            <ElButton text type="primary" @click="swrap($index, 'top')" v-if="$index !== 0">置顶</ElButton>
            <ElButton text type="primary" @click="swrap($index, 'down')" v-if="$index !== dataList.length - 1">置底
            </ElButton>
          </div>
        </template>
      </ElTableColumn>
    </ElTable>
    <CustomDialog v-model="addVisible" title="添加" :width="1000" maxHeight="60vh" :onConfirm="onAddConfirm">
      <AddApiTestRow ref="addRef" :detail="editData" @success="onSave" />
    </CustomDialog>
    <CustomDialog v-model="copyVisible" title="复制" :width="230" :onConfirm="onCopy">
      <ElSelect v-model="copySheet">
        <ElOption v-for="tab in tabList" :label="tab.name" :value="tab.name" :key="`copy-${tab.name}`"></ElOption>
      </ElSelect>
    </CustomDialog>
  </div>
</template>
<script lang="ts" setup>
import { ElMessage, ElMessageBox } from 'element-plus';
import { inject, provide, Ref, ref, toRef, watch } from 'vue';
import { AddApiTestExcel, ApiTestExcel, ApiTestExcelPane, ApiTestRequestDataFormat } from '..';
import { getId } from '../../../utils';
import AddApiTestRow from './AddApiTestRow.vue';
import CustomDialog from './CustomDialog.vue';

type Props = {
  dataList: ApiTestExcel[];
  tabList: ApiTestExcelPane[];
  currentTab: string;
};

const props = withDefaults(defineProps<Props>(), {
  dataList: () => [],
  tabList: () => [],
  currentTab: '',
});

const addVisible = ref(false);

provide('excelData', props);

const rowStyle = ({ row }: { row: ApiTestExcel }) => {
  if (!row.RequestDataFormat) return {}
  try {
    const temp = JSON.parse(row.RequestDataFormat);
    const index = temp.findIndex((item: ApiTestRequestDataFormat) =>
      typeof item.row !== 'undefined' && props.dataList.findIndex(val => val._id === item.rowId) === -1
    )
    if (index > -1) {
      return {
        color: 'red'
      }
    } return {}
  } catch (err) {
    return {}
  }
}

const editData = ref<AddApiTestExcel | undefined>(undefined);
const copyData = ref<ApiTestExcel | undefined>(undefined);

const add = () => {
  editData.value = undefined;
  addVisible.value = true;
};
const edit = (row: ApiTestExcel) => {
  let rdf = [];
  try {
    rdf = JSON.parse(row.RequestDataFormat);
  } catch (error) { }
  let ghs = [];
  try {
    ghs = JSON.parse(row.globalHeaders);
  } catch (error) { }
  editData.value = { ...row, RequestDataFormat: rdf, globalHeaders: ghs };
  addVisible.value = true;
};

const tabList = inject<Ref<ApiTestExcelPane[]>>('tabList');

const calcRow = () => {
  console.log();
  tabList?.value.forEach((pane) => {
    pane.dataList.forEach((el, index) => {
      if (pane.name === props.currentTab) {
        el.id = index + 1;
      }
      if (el.RequestDataFormat) {
        try {
          const temp = JSON.parse(el.RequestDataFormat);
          temp.forEach((item: ApiTestRequestDataFormat) => {
            if (typeof item.row !== 'undefined' && (item.sheetName ?? pane.name) === props.currentTab) {
              item.row = props.dataList.findIndex(val => val._id === item.rowId) + 1;
            }
          })
          el.RequestDataFormat = JSON.stringify(temp);
        } catch (error) { }
      }
    })
  })
}

const swrap = (index: number, type: 'up' | 'down' | 'top' | 'bottom') => {
  const temp = props.dataList[index];
  switch (type) {
    case 'up':
      if (index === 0) return;
      props.dataList[index] = props.dataList[index - 1];
      props.dataList[index - 1] = temp;
      break;
    case 'down':
      if (index === props.dataList.length - 1) return;
      props.dataList[index] = props.dataList[index + 1];
      props.dataList[index + 1] = temp;
      break;
    case 'top':
      if (index === 0) return;
      props.dataList.splice(index, 1);
      props.dataList.unshift(temp);
      break;
    case 'bottom':
      if (index === props.dataList.length - 1) return;
      props.dataList.splice(index, 1);
      props.dataList.push(temp);
      break;
  }
  calcRow();
}
const copyVisible = ref(false);
const copySheet = ref(props.currentTab);
watch(() => props.currentTab, () => {
  console.log(props.currentTab)
  copySheet.value = props.currentTab;
})
const copy = (row: ApiTestExcel) => {
  copyData.value = row;
  copyVisible.value = true;
}
const onCopy = () => {
  const index = props.tabList.findIndex(({ name }) => name === copySheet.value);
  if (index > -1) {
    props.tabList[index].dataList.push({ ...copyData.value, _id: getId(), id: props.tabList[index].dataList.length + 1 } as ApiTestExcel)
  }
  copySheet.value = props.currentTab;
  copyData.value = undefined;
  copyVisible.value = false;
  return Promise.resolve();
}

const deleteRow = (row: ApiTestExcel) => {
  ElMessageBox.confirm('是否删除', '删除', { type: 'warning' }).then(() => {
    const index = props.dataList.findIndex(el => el._id === row._id);
    if (index > -1) {
      props.dataList.splice(index, 1);
      calcRow();
    }
  })
}

const onSave = (saveData: AddApiTestExcel) => {
  const modifyData = props.dataList.find((el) => el._id === saveData._id);
  const {
    _id,
    method,
    data,
    module,
    url,
    sql,
    Expected_code,
    FormData = '{}',
    ActualDataFormat,
    delay,
    RequestDataFormat,
    headers,
    globalHeaders,
  } = saveData;
  const dataStr = data ? JSON.stringify(JSON.parse(data)) : '{}';
  const FormDataStr = FormData ? JSON.stringify(JSON.parse(FormData)) : '{}';
  const headersStr = headers ? JSON.stringify(JSON.parse(headers)) : '{}';
  if (modifyData) {
    modifyData.method = method;
    modifyData.module = module;
    modifyData.url = url;
    modifyData.data = dataStr;
    modifyData.sql = sql;
    modifyData.Expected_code = Expected_code;
    modifyData.FormData = FormDataStr;
    modifyData.RequestDataFormat = JSON.stringify(RequestDataFormat);
    modifyData.ActualDataFormat = ActualDataFormat;
    modifyData.delay = delay;
    modifyData.headers = headersStr;
    modifyData.globalHeaders = JSON.stringify(globalHeaders);
    props.dataList.push({
      _id,
      id: props.dataList.length + 1,
      method,
      module,
      url,
      data: dataStr,
      sql,
      Expected_code,
      Actual_code: '',
      sql_result: '',
      Result: '',
      Reason: '',
      FormData: FormDataStr,
      RequestDataFormat: JSON.stringify(RequestDataFormat),
      ActualDataFormat,
      delay,
      headers: headersStr,
      globalHeaders: JSON.stringify(globalHeaders),
    });
  }
};

const addRef = ref<InstanceType<typeof AddApiTestRow>>();

const onAddConfirm = () =>
  addRef.value ? addRef.value.onSubmit() : Promise.resolve();
</script>
<style scoped lang="scss">
.api-test-list {
  padding: 20px;

  .top-action-box {
    margin-bottom: 16px;
    display: flex;

    .el-button {
      margin-right: 8px;
    }
  }

  .operation-btns {
    .el-button {
      padding-left: 0;
      padding-right: 0;
    }
  }
}
</style>
