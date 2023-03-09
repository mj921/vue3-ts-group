<template>
  <ElDialog v-model="visible" :title="title" :width="width" append-to-body destroy-on-close>
    <div class="customer-dialog-body" :style="{ maxHeight: computedMaxHeight }">
      <slot></slot>
    </div>
    <template #footer>
      <el-button type="primary" @click="confirm">{{ confirmBtnText }}</el-button>
      <el-button @click="visible = false">{{ cancelBtnText }}</el-button>
    </template>
  </ElDialog>
</template>
<script lang="ts" setup>
import { computed } from 'vue';

type Props = {
  modelValue?: boolean;
  title: string;
  width?: number;
  confirmBtnText?: string;
  cancelBtnText?: string;
  maxHeight?: number | string;
  onConfirm?: () => Promise<unknown>;
};
type Emits = {
  (e: 'update:modelValue', val: boolean): void;
};
const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  width: 800,
  maxHeight: 'auto',
  confirmBtnText: '保存',
  cancelBtnText: '取消',
});
const emits = defineEmits<Emits>();

const computedMaxHeight = computed(() => {
  return typeof props.maxHeight === 'string' ? props.maxHeight : `${props.maxHeight}px`
})

const visible = computed({
  get: () => {
    return props.modelValue;
  },
  set: (val: boolean) => {
    emits('update:modelValue', val);
  },
});
const confirm = () => {
  if (props.onConfirm) {
    props.onConfirm().then(() => {
      visible.value = false;
    })
  } else {
    visible.value = false;
  }
}
</script>
<style scoped lang="scss">
.customer-dialog-body {
  overflow: auto;
}
</style>