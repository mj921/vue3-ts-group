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
      <JsonEditor v-model="addForm.ActualDataFormat" />
    </ElFormItem>
    <ElFormItem prop="delay" label="delay">
      <ElInput v-model.number="addForm.delay" />
    </ElFormItem>
    <ElFormItem prop="headers" label="headers">
      <JsonEditor v-model="addForm.headers" />
    </ElFormItem>
    <ElFormItem prop="globalHeaders" label="globalHeaders">
      <GlobalHeaderList v-model="addForm.globalHeaders" />
    </ElFormItem>
  </ElForm>
</template>
<script lang="ts" setup>
import { FormInstance, FormRules } from 'element-plus';
import { reactive, ref, toRaw } from 'vue';
import { AddApiTestExcel } from '..';
import { getId } from '../../../utils';
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
    _id: getId(),
    method: 'get',
    module: '',
    url: '',
    data: '{}',
    sql: `{code:0,condition:[],my_sql:'',result:'',database:'',resultType:'',equalType:''}`,
    Expected_code: '',
    FormData: '{}',
    RequestDataFormat: [],
    ActualDataFormat: '',
    delay: 0,
    headers: '{}',
    globalHeaders: [],
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
defineExpose({
  onSubmit,
});
</script>
<style scoped lang="scss"></style>
