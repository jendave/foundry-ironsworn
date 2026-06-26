<template>
	<div class="editor flexcol" style="cursor: pointer;" @click="$emit('editclick')">
		<WithRolllisteners
			element="div"
			class="editor-content"
			v-html="renderedContent || placeholder"
		/>
	</div>
</template>

<script setup lang="ts">
import { watch, ref } from 'vue'
import { enrichHtml } from '../vue-plugin.js'

import WithRolllisteners from './with-rolllisteners.vue'

const props = defineProps<{
	text: string
	placeholder?: string
}>()
defineEmits(['editclick'])

const renderedContent = ref<string>(props.text)
watch(
	() => props.text,
	async () => {
		renderedContent.value = await enrichHtml(props.text)
	},
	{ immediate: true }
)
</script>
