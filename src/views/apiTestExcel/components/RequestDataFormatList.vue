<template>
  <div style="margin-bottom: 8px">
    <ElButton type="primary" size="small" @click="add">添加</ElButton>
  </div>
  <ElTable :data="list">
    <ElTableColumn label="type" prop="type" :min-width="80" fixed="left"></ElTableColumn>
    <ElTableColumn label="path" prop="path" :min-width="100" fixed="left"></ElTableColumn>
    <ElTableColumn label="sheetName" prop="row" :min-width="100"></ElTableColumn>
    <ElTableColumn label="row" prop="row" :min-width="50"></ElTableColumn>
    <ElTableColumn label="valuePath" prop="valuePath" :min-width="100"></ElTableColumn>
    <ElTableColumn label="prefix" prop="prefix" :min-width="120"></ElTableColumn>
    <ElTableColumn label="suffix" prop="suffix" :min-width="120"></ElTableColumn>
    <ElTableColumn label="listSearch" prop="listSearch" :min-width="100"></ElTableColumn>
    <ElTableColumn label="操作" fixed="right" :min-width="80">
      <template v-slot="{ row, $index }">
        <div class="operation-btns">
          <ElButton text type="primary" @click="edit(row, $index)">编辑</ElButton>
        </div>
      </template>
    </ElTableColumn>
  </ElTable>
  <CustomDialog v-model="addVisible" title="添加" :onConfirm="onAddConfirm">
    <AddRequestDataFormat ref="addRef" :detail="editData" @success="onSave" />
  </CustomDialog>
</template>
<script lang="ts" setup>
import { computed, ref } from 'vue';
import { ApiTestRequestDataFormat } from '..';
import CustomDialog from './CustomDialog.vue';
import AddRequestDataFormat from './AddRequestDataFormat.vue';

type Props = {
  modelValue: ApiTestRequestDataFormat[];
};

type Emits = {
  (e: 'update:modelValue', val: ApiTestRequestDataFormat[]): void;
};

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
});
const emits = defineEmits<Emits>();

const list = computed({
  get: () => props.modelValue,
  set: (val: ApiTestRequestDataFormat[]) => {
    emits('update:modelValue', val);
  },
});

const addVisible = ref(false);
const editDataIndex = ref<number>(-1);
const editData = ref<ApiTestRequestDataFormat | undefined>(undefined);
const add = () => {
  editData.value = undefined;
  editDataIndex.value = -1
  addVisible.value = true;
};
const edit = (row: ApiTestRequestDataFormat, index: number) => {
  editData.value = row;
  editDataIndex.value = index;
  addVisible.value = true;
};
const onSave = (val: ApiTestRequestDataFormat) => {
  if (editData.value) {
    list.value[editDataIndex.value] = val;
    editData.value = undefined;
    editDataIndex.value = -1;
  } else {
    list.value.push(val);
  }
  addVisible.value = false;
}
const addRef = ref<InstanceType<typeof AddRequestDataFormat>>();
const onAddConfirm = () =>
  addRef.value ? addRef.value.onSubmit() : Promise.resolve();
</script>
<style scoped lang="scss"></style>
