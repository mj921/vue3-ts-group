<template>
  <ElForm ref="formRef" :model="addForm" :label-width="160" :rules="rules">
    <ElFormItem prop="type" label="type">
      <ElSelect v-model="addForm.type">
        <ElOption v-for="option in typeList" :label="option" :value="option" :key="'type_' + option"></ElOption>
      </ElSelect>
    </ElFormItem>
    <ElFormItem prop="path" label="path">
      <ElInput v-model="addForm.path" />
    </ElFormItem>
    <ElFormItem prop="key" label="key">
      <ElInput v-model="addForm.key" />
    </ElFormItem>
  </ElForm>
</template>
<script lang="ts" setup>
import { FormInstance, FormRules } from 'element-plus';
import { computed, reactive, ref, toRaw } from 'vue';
import { ApiTestGlobalHeaderFormat } from '..';
import SelectApiTestRow from './SelectApiTestRow.vue';

type Props = {
  detail?: ApiTestGlobalHeaderFormat;
};
const props = withDefaults(defineProps<Props>(), {
  detail: () => ({
    type: 'cover',
    path: '',
    key: '',
  }),
});
type Emits = {
  (e: 'success', val: ApiTestGlobalHeaderFormat): void;
};

const emits = defineEmits<Emits>();

const addForm = reactive<ApiTestGlobalHeaderFormat>(props.detail);
const typeList = ['cover', 'add'];

const rules = computed<FormRules>(() => ({
  type: [{ required: true, message: '请选择type' }],
  path: [{ required: true, message: '请输入path' }],
  key: [{ required: true, message: '请输入key' }],
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
