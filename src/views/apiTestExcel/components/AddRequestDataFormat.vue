<template>
  <ElForm ref="formRef" :model="addForm" :label-width="160" :rules="rules">
    <ElFormItem prop="type" label="type">
      <ElSelect v-model="addForm.type" @change="onTypeChange">
        <ElOption
          v-for="option in typeList"
          :label="option"
          :value="option"
          :key="'type_' + option"
        ></ElOption>
      </ElSelect>
    </ElFormItem>
    <ElFormItem prop="path" label="path">
      <ElInput v-model="addForm.path" />
    </ElFormItem>
    <ElFormItem
      prop="row"
      label="row"
      v-if="['request', 'response'].includes(addForm.type)"
    >
      <ElInput
        :model-value="addForm.row || ''"
        readonly
        :suffix-icon="CirclePlus"
        @click="selectVisible = true"
      />
    </ElFormItem>
    <ElFormItem
      prop="valuePath"
      label="valuePath"
      v-if="['request', 'response'].includes(addForm.type)"
    >
      <ElInput v-model="addForm.valuePath" />
    </ElFormItem>
    <ElFormItem
      prop="listSearch"
      label="listSearch"
      v-if="['request', 'response'].includes(addForm.type)"
    >
      <JsonEditor v-model="addForm.listSearch" :lines="4" />
    </ElFormItem>
    <ElFormItem prop="prefix" label="prefix" v-if="addForm.type === 'now'">
      <ElInput v-model="addForm.prefix" />
    </ElFormItem>
    <ElFormItem prop="suffix" label="suffix" v-if="addForm.type === 'now'">
      <ElInput v-model="addForm.suffix" />
    </ElFormItem>
  </ElForm>
  <CustomDialog v-model="selectVisible" title="添加" :onConfirm="onAddConfirm">
    <SelectApiTestRow v-model="addForm.rowId" ref="selectRef" @select="onRowSelect" />
  </CustomDialog>
</template>
<script lang="ts" setup>
import { FormInstance, FormRules } from 'element-plus';
import { computed, reactive, ref, toRaw } from 'vue';
import { ApiTestRequestDataFormat, ApiTestExcel } from '..';
import JsonEditor from './JsonEditor.vue';
import CustomDialog from './CustomDialog.vue';
import SelectApiTestRow from './SelectApiTestRow.vue';
import { CirclePlus } from '@element-plus/icons-vue';

type Props = {
  detail?: ApiTestRequestDataFormat;
};
const props = withDefaults(defineProps<Props>(), {
  detail: () => ({
    type: 'response',
    path: '',
    valuePath: '',
    row: 0,
    rowId: '',
    suffix: '',
    prefix: '',
    listSearch: '[]',
  }),
});
type Emits = {
  (e: 'success', val: ApiTestRequestDataFormat): void;
};

const emits = defineEmits<Emits>();

const addForm = reactive<ApiTestRequestDataFormat>(props.detail);
const typeList = ['response', 'request', 'now'];

const selectVisible = ref(false);

const rules = computed<FormRules>(() => ({
  type: [{ required: true, message: '请选择type' }],
  path: [{ required: true, message: '请输入path' }],
  row: [
    {
      required: ['request', 'response'].includes(addForm.type),
      validator: (rule, value, callback) => {
        if (value === '' || value === 0 || value === '0') {
          callback(new Error('请选择row'));
        } else {
          callback();
        }
      },
    },
  ],
  valuePath: [
    {
      required: ['request', 'response'].includes(addForm.type),
      message: '请输入valuePath',
    },
  ],
}));

const onTypeChange = () => {
  addForm.path = '';
  addForm.valuePath = '';
  addForm.row = 0;
  addForm.rowId = '';
  addForm.suffix = '';
  addForm.prefix = '';
  addForm.listSearch = '[]';
};

const onRowSelect = (selectData: ApiTestExcel) => {
  addForm.row = selectData.id;
  addForm.rowId = selectData._id;
};

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
const onAddConfirm = () => {
  selectRef.value?.onConfirm();
  return Promise.resolve();
}
defineExpose({
  onSubmit,
})
</script>
<style scoped lang="scss"></style>
