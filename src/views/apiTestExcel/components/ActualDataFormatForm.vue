<template>
  <ElForm ref="formRef" :model="addForm" :label-width="160" :rules="rules">
    <ElFormItem prop="path" label="path">
      <ElInput v-model="addForm.path" />
    </ElFormItem>
  </ElForm>
</template>
<script lang="ts" setup>
import { FormInstance, FormRules } from 'element-plus';
import { computed, reactive, ref, toRaw } from 'vue';
import { ApiTestActualDataFormat } from '..';

type Props = {
  detail?: ApiTestActualDataFormat;
};
const props = withDefaults(defineProps<Props>(), {
  detail: () => ({
    path: '',
  }),
});
type Emits = {
  (e: 'success', val: ApiTestActualDataFormat): void;
};

const emits = defineEmits<Emits>();

const addForm = reactive<ApiTestActualDataFormat>(props.detail);

const rules = computed<FormRules>(() => ({
  path: [{ required: true, message: '请输入path' }],
}));

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
    })
  });
};
defineExpose({
  onSubmit,
})
</script>
<style scoped lang="scss"></style>
