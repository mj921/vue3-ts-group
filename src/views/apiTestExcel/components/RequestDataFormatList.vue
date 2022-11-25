<template>
  <div style="margin-bottom: 8px;">
    <ElButton type="primary" size="small" @click="addVisible = true">添加</ElButton>
  </div>
  <ElTable :data="list">
    <ElTableColumn label="row" prop="row"></ElTableColumn>
    <ElTableColumn label="type" prop="type"></ElTableColumn>
    <ElTableColumn label="path" prop="path"></ElTableColumn>
    <ElTableColumn label="valuePath" prop="valuePath"></ElTableColumn>
    <ElTableColumn label="prefix" prop="prefix"></ElTableColumn>
    <ElTableColumn label="suffix" prop="suffix"></ElTableColumn>
    <ElTableColumn label="listSearch" prop="listSearch"></ElTableColumn>
  </ElTable>
  <CustomDialog v-model="addVisible" title="添加" :onConfirm="onAddConfirm">
    <AddRequestDataFormat />
  </CustomDialog>
</template>
<script lang="ts" setup>
import { computed, ref } from 'vue';
import { ApiTestRequestDataFormat } from '..';
import CustomDialog from './CustomDialog.vue';
import AddRequestDataFormat from './AddRequestDataFormat.vue';

type Props = {
  modelValue: ApiTestRequestDataFormat[];
}

type Emits = {
  (e: 'update:modelValue', val: ApiTestRequestDataFormat[]): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => []
});
const emits = defineEmits<Emits>();

const list = computed({
  get: () => props.modelValue,
  set: (val: ApiTestRequestDataFormat[]) => {
    emits('update:modelValue', val);
  }
});

const addVisible = ref(false);
const addRef = ref<InstanceType<typeof AddRequestDataFormat>>();
const onAddConfirm = () => addRef.value ? addRef.value.onSubmit() : Promise.resolve();
</script>
<style scoped lang="scss">
</style>