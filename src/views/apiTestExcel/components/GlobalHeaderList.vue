<template>
  <div style="margin-bottom: 8px">
    <ElButton type="primary" size="small" @click="add">添加</ElButton>
  </div>
  <ElTable :data="list">
    <ElTableColumn label="key" prop="key" :minWidth="120"></ElTableColumn>
    <ElTableColumn label="type" prop="type" :minWidth="80"></ElTableColumn>
    <ElTableColumn label="path" prop="path" :minWidth="120"></ElTableColumn>
    <ElTableColumn label="操作" fixed="right" :minWidth="80">
      <template v-slot="{ row, $index }">
        <div class="operation-btns">
          <ElButton text type="primary" @click="edit(row, $index)">编辑</ElButton>
        </div>
      </template>
    </ElTableColumn>
  </ElTable>
  <CustomDialog v-model="addVisible" title="添加" :onConfirm="onAddConfirm">
    <AddGlobalHeader ref="addRef" :detail="editData" @success="onSave" />
  </CustomDialog>
</template>
<script lang="ts" setup>
import { computed, ref } from 'vue';
import { ApiTestGlobalHeaderFormat } from '../../../types';
import CustomDialog from './CustomDialog.vue';
import AddRequestDataFormat from './AddRequestDataFormat.vue';
import AddGlobalHeader from './AddGlobalHeader.vue';

type Props = {
  modelValue: ApiTestGlobalHeaderFormat[];
};

type Emits = {
  (e: 'update:modelValue', val: ApiTestGlobalHeaderFormat[]): void;
};

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
});
const emits = defineEmits<Emits>();

const list = computed({
  get: () => props.modelValue,
  set: (val: ApiTestGlobalHeaderFormat[]) => {
    emits('update:modelValue', val);
  },
});

const addVisible = ref(false);
const editDataIndex = ref<number>(-1);
const editData = ref<ApiTestGlobalHeaderFormat | undefined>(undefined);
const add = () => {
  editData.value = undefined;
  editDataIndex.value = -1;
  addVisible.value = true;
};
const edit = (row: ApiTestGlobalHeaderFormat, index: number) => {
  editData.value = row;
  editDataIndex.value = index;
  addVisible.value = true;
};
const onSave = (val: ApiTestGlobalHeaderFormat) => {
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
