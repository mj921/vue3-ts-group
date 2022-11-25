<template>
  <ElTable
    :data="data"
    border
    highlight-current-row
    @current-change="selectChange"
  >
    <ElTableColumn :min-width="40">
      <template v-slot="{ row }">
        <ElRadioGroup v-model="radioValue">
          <ElRadio :label="row._id" size="small"></ElRadio>
        </ElRadioGroup>
      </template>
    </ElTableColumn>
    <ElTableColumn prop="id" label="id" :min-width="40"></ElTableColumn>
    <ElTableColumn
      prop="method"
      label="method"
      :min-width="80"
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

type Emit = {
  (e: 'select', val: ApiTestExcel): void;
};
const emit = defineEmits<Emit>();

const data = inject<ApiTestExcel[]>('excelData');
const selectRow = ref<ApiTestExcel | null>(null);
const radioValue = ref('');
const selectChange = (row: ApiTestExcel) => {
  radioValue.value = row._id;
  selectRow.value = row;
};
const onConfirm = () => {
  selectRow.value && emit('select', selectRow.value);
};
defineExpose({
  onConfirm
})
</script>
<style scoped lang="scss"></style>
