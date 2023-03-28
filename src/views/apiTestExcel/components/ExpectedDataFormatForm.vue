<template>
  <ElForm ref="formRef" :model="addForm" :label-width="160" :rules="rules"><ElFormItem prop="type" label="type">
      <ElSelect v-model="addForm.type" @change="onTypeChange">
        <ElOption v-for="option in typeList" :label="option" :value="option" :key="'type_' + option"></ElOption>
      </ElSelect>
    </ElFormItem>
    <ElFormItem prop="path" label="path">
      <ElInput v-model="addForm.path" />
    </ElFormItem>
    <ElFormItem prop="jsonpath" label="jsonpath">
      <ElInput v-model="addForm.jsonpath" />
    </ElFormItem>
    <ElFormItem prop="row" label="row" v-if="['request', 'response'].includes(addForm.type)">
      <ElInput :model-value="(addForm.sheetName || currentTab) + '/' + addForm.row || ''" readonly
        :suffix-icon="CirclePlus" @click="selectVisible = true" />
    </ElFormItem>
    <ElFormItem prop="value" label="value" v-if="['text'].includes(addForm.type)">
      <ElInput v-model="addForm.value" />
    </ElFormItem>
    <ElFormItem prop="listSearch" label="listSearch" v-if="['request', 'response'].includes(addForm.type)">
      <JsonEditor v-model="addForm.listSearch" :lines="4" />
    </ElFormItem>
    <ElFormItem prop="prefix" label="prefix" v-if="addForm.type === 'now'">
      <ElInput v-model="addForm.prefix" />
    </ElFormItem>
    <ElFormItem prop="suffix" label="suffix" v-if="addForm.type === 'now'">
      <ElInput v-model="addForm.suffix" />
    </ElFormItem>
    <ElFormItem prop="timeFmt" label="timeFmt" v-if="addForm.type === 'now'">
      <ElInput v-model="addForm.timeFmt" />
    </ElFormItem>
    <ElFormItem prop="addTime" label="addTime" v-if="addForm.type === 'now'">
      <ElInput type="number" v-model.number="addForm.addTime" />
    </ElFormItem>
  </ElForm>
  <CustomDialog v-model="selectVisible" title="添加" :onConfirm="onAddConfirm">
    <SelectApiTestRow v-model="addForm.rowId" ref="selectRef" @select="onRowSelect" />
  </CustomDialog>
</template>
<script lang="ts" setup>
import { FormInstance, FormRules } from 'element-plus';
import { computed, inject, reactive, ref, toRaw } from 'vue';
import { ApiTestExcel, ApiTestExpectedCodeFormat } from '../../../types';
import { CirclePlus } from '@element-plus/icons-vue';
import SelectApiTestRow from './SelectApiTestRow.vue';

type Props = {
  detail?: ApiTestExpectedCodeFormat;
};
const props = withDefaults(defineProps<Props>(), {
  detail: () => ({
    path: '',
    type: 'text',
  }),
});
type Emits = {
  (e: 'success', val: ApiTestExpectedCodeFormat): void;
};

const emits = defineEmits<Emits>();

const addForm = reactive<ApiTestExpectedCodeFormat>(props.detail);
const typeList = ['response', 'request', 'now', 'text'];
const currentTab = inject('currentTab');
const selectVisible = ref(false);

const rules = computed<FormRules>(() => ({
  path: [{ required: true, message: '请输入path' }],
}));

const formRef = ref<FormInstance>();
const selectRef = ref<InstanceType<typeof SelectApiTestRow>>();

const onSubmit = () => {
  return new Promise((resolve, reject) => {
    formRef.value?.validate((falg: boolean) => {
      if (falg) {
        emits('success', toRaw(addForm));
        resolve(true);
      } else {
        reject();
      }
    })
  });
};
const onTypeChange = () => {
  delete addForm.prefix;
  delete addForm.suffix;
  delete addForm.sheetName;
  delete addForm.timeFmt;
  delete addForm.value;
  delete addForm.rowId;
  delete addForm.addTime;
  delete addForm.jsonpath;
  addForm.path = '';
  addForm.row = 0;
  if (['now', 'text'].includes(addForm.type)) {
    delete addForm.listSearch;
  } else {
    addForm.listSearch = '[]';
  }
};
const onRowSelect = (selectData: ApiTestExcel, tabName: string) => {
  addForm.row = selectData.id;
  addForm.sheetName = tabName;
  addForm.rowId = selectData._id;
};
const onAddConfirm = () => {
  selectRef.value?.onConfirm();
  return Promise.resolve();
}
defineExpose({
  onSubmit,
})
</script>
<style scoped lang="scss"></style>
