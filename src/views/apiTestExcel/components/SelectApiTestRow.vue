<template>
  <ElTable
    :data="data?.dataList"
    border
    highlight-current-row
    @current-change="selectChange"
  >
    <ElTableColumn :min-width="40">
      <template v-slot="{ row }">
        <ElRadioGroup :modelValue="modelValue">
          <ElRadio size="small" :label="row._id"><span></span></ElRadio>
        </ElRadioGroup>
      </template>
    </ElTableColumn>
    <ElTableColumn prop="id" label="id" :width="50"></ElTableColumn>
    <ElTableColumn
      prop="method"
      label="method"
      :width="80"
    ></ElTableColumn>
    <ElTableColumn
      prop="module"
      label="module"
      :min-width="100"
    ></ElTableColumn>
    <ElTableColumn prop="url" label="url" :min-width="120"></ElTableColumn>
    <ElTableColumn prop="data" label="data" :min-width="160"></ElTableColumn>
  </ElTable>
</template>
<script lang="ts" setup>
import { ElRadioGroup } from 'element-plus';
import { inject, ref } from 'vue';
import { ApiTestExcel } from '..';

type Props = {
  modelValue: string;
}

type Emits = {
  (e: 'select', val: ApiTestExcel): void;
  (e: 'update:modelValue', val: string): void;
};

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
})
const emits = defineEmits<Emits>();

const data = inject<{ dataList: ApiTestExcel[] }>('excelData');
const selectRow = ref<ApiTestExcel | null>(null);
const selectChange = (row: ApiTestExcel) => {
  emits('update:modelValue', row._id);
  selectRow.value = row;
};
const onConfirm = () => {
  selectRow.value && emits('select', selectRow.value);
};
defineExpose({
  onConfirm
})
</script>
<style scoped lang="scss"></style>
