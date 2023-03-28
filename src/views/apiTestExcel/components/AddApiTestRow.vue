<template>
  <ElForm ref="formRef" :model="addForm" :label-width="160" :rules="rules">
    <ElFormItem prop="method" label="method">
      <ElSelect v-model="addForm.method">
        <ElOption v-for="option in methodList" :label="option" :value="option" :key="'method_' + option"></ElOption>
      </ElSelect>
    </ElFormItem>
    <ElFormItem prop="module" label="module">
      <ElInput v-model="addForm.module" />
    </ElFormItem>
    <ElFormItem prop="url" label="url">
      <ElInput v-model="addForm.url" />
    </ElFormItem>
    <ElFormItem prop="data" label="data">
      <JsonEditor v-model="addForm.data" />
    </ElFormItem>
    <ElFormItem prop="sql" label="sql">
      <ElInput type="textarea" :rows="5" v-model="addForm.sql" />
    </ElFormItem>
    <ElFormItem prop="Expected_code" label="Expected_code">
      <ElInput v-model="addForm.Expected_code" />
    </ElFormItem>
    <ElFormItem prop="FormData" label="FormData">
      <JsonEditor v-model="addForm.FormData" />
    </ElFormItem>
    <ElFormItem prop="RequestDataFormat" label="RequestDataFormat">
      <RequestDataFormatList v-model="addForm.RequestDataFormat" />
    </ElFormItem>
    <ElFormItem prop="ActualDataFormat" label="ActualDataFormat">
      <JsonEditor v-model="addForm.ActualDataFormat" disabled>
        <ElButton size="small" type="primary" v-if="addForm.ActualDataFormat" @click="editActualData">修改</ElButton>
        <ElButton size="small" type="primary" v-else @click="addActualData">添加</ElButton>
        <ElButton size="small" type="primary" v-if="addForm.ActualDataFormat" @click="addForm.ActualDataFormat = ''">清空
        </ElButton>
      </JsonEditor>
    </ElFormItem>
    <ElFormItem prop="delay" label="delay">
      <ElInput v-model="addForm.delay" clearable />
    </ElFormItem>
    <ElFormItem prop="headers" label="headers">
      <JsonEditor v-model="addForm.headers" />
    </ElFormItem>
    <ElFormItem prop="globalHeaders" label="globalHeaders">
      <GlobalHeaderList v-model="addForm.globalHeaders" />
    </ElFormItem>
    <ElFormItem prop="zmip" label="zmip">
      <ElSelect v-model="addForm.zmip" clearable>
        <ElOption label="y" value="y" />
      </ElSelect>
    </ElFormItem>
    <ElFormItem prop="ExpectedCodeFormat" label="ExpectedCodeFormat">
      <JsonEditor v-model="addForm.ExpectedCodeFormat" disabled>
        <ElButton size="small" type="primary" v-if="addForm.ExpectedCodeFormat" @click="editExpected">修改</ElButton>
        <ElButton size="small" type="primary" v-else @click="addExpected">添加</ElButton>
        <ElButton size="small" type="primary" v-if="addForm.ExpectedCodeFormat" @click="addForm.ExpectedCodeFormat = ''">
          清空
        </ElButton>
      </JsonEditor>
    </ElFormItem>
  </ElForm>
  <CustomDialog v-model="actualDataVisible" title="添加" :onConfirm="onAddConfirm">
    <ActualDataFormatForm :detail="editData" ref="actualDataFormRef" @success="onSave" />
  </CustomDialog>
  <CustomDialog v-model="exceptedCodeVisible" title="添加" :onConfirm="onExpectedAddConfirm">
    <ExpectedCodeFormatForm :detail="editExpectedData" ref="exceptedCodeFormRef" @success="onExpectedCodeSave" />
  </CustomDialog>
</template>
<script lang="ts" setup>
import { FormInstance, FormRules } from 'element-plus';
import { reactive, ref, toRaw } from 'vue';
import { AddApiTestExcel, ApiTestActualDataFormat, ApiTestExpectedCodeFormat } from '../../../types';
import { generateUuid } from '../../../utils';
import CustomDialog from './CustomDialog.vue';
import ActualDataFormatForm from './ActualDataFormatForm.vue'
import ExpectedCodeFormatForm from './ExpectedDataFormatForm.vue'
import GlobalHeaderList from './GlobalHeaderList.vue';
import JsonEditor from './JsonEditor.vue';
import RequestDataFormatList from './RequestDataFormatList.vue';

type Props = {
  detail?: AddApiTestExcel;
};

type Emits = {
  (e: 'success', val: AddApiTestExcel): void;
};

const props = defineProps<Props>();
const emits = defineEmits<Emits>();

const addForm = reactive<AddApiTestExcel>(
  props.detail || {
    _id: generateUuid(),
    method: 'get',
    module: '',
    url: '',
    data: '{}',
    sql: `{code:0,condition:[],my_sql:'',result:'',database:'',resultType:'',equalType:''}`,
    Expected_code: '',
    FormData: '{}',
    RequestDataFormat: [],
    ActualDataFormat: '',
    delay: '',
    headers: '{}',
    globalHeaders: [],
    zmip: '',
    ExpectedCodeFormat: '',
  }
);
const methodList = [
  'get',
  'put',
  'post',
  'delete',
  'patch',
  'options',
  'head',
  'connect',
];

const actualDataVisible = ref(false);
const exceptedCodeVisible = ref(false);

const rules: FormRules = {
  method: [{ required: true, message: '请选择method' }],
  url: [{ required: true, message: '请输入url' }],
  data: [
    {
      validator: (rule, value, callback) => {
        try {
          if (value) {
            JSON.parse(value);
          }
          callback();
        } catch (e: any) {
          callback('请输入正确的json格式');
        }
      },
    },
  ],
};
const actualDataFormRef = ref<InstanceType<typeof ActualDataFormatForm>>();
const exceptedCodeFormRef = ref<InstanceType<typeof ExpectedCodeFormatForm>>();
const editData = ref<ApiTestActualDataFormat | undefined>(undefined);
const editExpectedData = ref<ApiTestExpectedCodeFormat | undefined>(undefined);
const addActualData = () => {
  editData.value = undefined;
  actualDataVisible.value = true;
}
const editActualData = () => {
  editData.value = addForm.ActualDataFormat ? JSON.parse(addForm.ActualDataFormat) : undefined;
  actualDataVisible.value = true;
}
const addExpected = () => {
  editExpectedData.value = undefined;
  actualDataVisible.value = true;
}
const editExpected = () => {
  editExpectedData.value = addForm.ExpectedCodeFormat ? JSON.parse(addForm.ExpectedCodeFormat) : undefined;
  actualDataVisible.value = true;
}
const onAddConfirm = () => {
  actualDataFormRef.value?.onSubmit();
  return Promise.resolve();
}
const onExpectedAddConfirm = () => {
  exceptedCodeFormRef.value?.onSubmit();
  return Promise.resolve();
}
const formRef = ref<FormInstance>();

const onSubmit = () => {
  return new Promise((resolve, reject) => {
    formRef.value?.validate((falg: boolean) => {
      if (falg) {
        emits('success', toRaw(addForm));
        resolve(true);
      } else {
        reject();
      }
    });
  });
};
const onSave = (val: ApiTestActualDataFormat) => {
  addForm.ActualDataFormat = JSON.stringify(val);
  editData.value = undefined;
}
const onExpectedCodeSave = (val: ApiTestExpectedCodeFormat) => {
  addForm.ExpectedCodeFormat = JSON.stringify(val);
  editData.value = undefined;
}
defineExpose({
  onSubmit,
});
</script>
<style scoped lang="scss"></style>
