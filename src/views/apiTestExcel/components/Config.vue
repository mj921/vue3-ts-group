<template>
  <ElForm ref="formRef" :label-width="160">
    <ElFormItem label="所思接口地址">
      <ElInput v-model="addForm.ip" />
    </ElFormItem>
    <ElFormItem label="卓盟接口地址">
      <ElInput v-model="addForm.zmip" />
    </ElFormItem>
    <ElFormItem label="运行的sheet">
      <ElSelect v-model="sheets" multiple clearable>
        <ElOption v-for="tab in tabList" :key="tab.name" :value="tab.name"></ElOption>
      </ElSelect>
    </ElFormItem>
  </ElForm>
</template>
<script lang="ts" setup>
import { FormInstance } from 'element-plus';
import { inject, reactive, ref, watch } from 'vue';
import { ApiTestExcelPane, ApiTextConfig } from '../../../types'

type Props = {
  runSheets?: string[];
};
type Emits = {
  (e: 'updateSheet', val: string[]): void;
}

const props = withDefaults(defineProps<Props>(), {
  runSheets: () => []
});
const emits = defineEmits<Emits>()

const sheets = ref(props.runSheets);
watch(() => props.runSheets, () => {
  sheets.value = props.runSheets;
})
const addForm = reactive<ApiTextConfig>({
  ip: localStorage.getItem('api_test_interface_ip') ?? 'https://front.sit.suosihulian.com/gateway',
  zmip: localStorage.getItem('api_test_interface_zmip') ?? 'https://pt-qa.lbian.cn'
})

const tabList = inject<ApiTestExcelPane[]>('tabList');

const formRef = ref<FormInstance>();

const onSubmit = () => {
  (Object.keys(addForm) as (keyof ApiTextConfig)[]).forEach(key => {
    localStorage.setItem(`api_test_interface_${key}`, addForm[key]);
  })
  emits('updateSheet', sheets.value);
  return Promise.resolve(true);
};
defineExpose({
  onSubmit,
})
</script>
<style scoped lang="scss"></style>
