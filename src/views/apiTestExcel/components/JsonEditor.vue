<template>
  <div style="margin-bottom: 8px;">
    <ElButton type="primary" size="small" @click="jsonInit">格式化</ElButton>
  </div>
  <VAceEditor
    v-model:value="content"
    lang="json"
    theme="chrome"
    @init="jsonInit"
    :options="{
      enableBasicAutocompletion: true,
      enableSnippets: true,
      enableLiveAutocompletion: true,
      tabSize: 2,
      showPrintMargin: false,
      fontSize: 13,
    }"
    :style="{
      height: `${lines * 17.5}px`,
      width: '100%',
    }"
  />
</template>
<script lang="ts" setup>
import { VAceEditor } from 'vue3-ace-editor';
import "ace-builds/webpack-resolver";
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-chrome';
import 'ace-builds/src-noconflict/ext-language_tools';
import { computed } from 'vue';

type Props = {
  modelValue: string | Object;
  lines?: number;
}

type Emits = {
  (e: 'update:modelValue', val: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '{}',
  lines: 16,
})
const emits = defineEmits<Emits>();

const content = computed({
  get: () => typeof props.modelValue === 'string' ? props.modelValue : JSON.stringify(props.modelValue),
  set: (val: string) => {
    emits('update:modelValue', val);
  }
})

const jsonInit = () => {
  try {
    content.value = content.value ? JSON.stringify(JSON.parse(content.value), null, 2) : '';
  } catch (error) {}
}
</script>
<style scoped lang="scss">
</style>