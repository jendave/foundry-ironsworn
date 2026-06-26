<template>
	<div class="nogrow flexrow">
		<IronCheckbox
			class="nogrow truth-radio"
			:checked="selected"
			@change="select">
			<template #checked="scope">
				<FontIcon
					v-bind="scope"
					name="dot-circle"
					:family="FontAwesome.Family.Regular" />
			</template>
			<template #unchecked="scope">
				<FontIcon
					v-bind="scope"
					name="circle"
					:family="FontAwesome.Family.Regular" />
			</template>
		</IronCheckbox>
		<RichEditor
			ref="editor"
			v-model="state.html"
			:style="{ height: state.height, 'min-height': state.height }"
			@save="emitHtml"
		/>
	</div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, reactive, ref } from 'vue'
import RichEditor from '../rich-editor.vue'
import IronCheckbox from '../input/iron-checkbox.vue'
import FontIcon from '../icon/font-icon.vue'
import { FontAwesome } from '../icon/icon-common'

defineProps<{
	radioGroup: string
	selected?: boolean
}>()

const editor = ref<typeof RichEditor>()

const state = reactive({
	html: '',
	height: '35px'
})

function select() {
	$emit('select')
	editor.value?.enableEditor()
	state.height = '300px'
}

// Do not emit change events from the editor if we've been unmounted
let emitChanges = true
onBeforeUnmount(() => {
	emitChanges = false
})

const $emit = defineEmits<{
	select: []
	change: [string]
}>()
function emitHtml() {
	if (emitChanges) $emit('change', state.html)
}
</script>

<style lang="scss" scoped>
.truth-radio {
	flex-grow: 0;
	flex-shrink: 0;
	flex-basis: var(--checkbox-size, 1.25rem);
	width: var(--checkbox-size, 1.25rem);
	height: var(--checkbox-size, 1.25rem);
	min-width: var(--checkbox-size, 1.25rem);
	align-self: flex-start;
	margin: var(--ironsworn-spacer-lg);
}

:deep(.editor:not(:has(.editor-content > *:not(:empty)))) .editor-content::before {
	content: attr(data-placeholder);
	color: var(--ironsworn-color-fg-muted, #888);
	font-style: italic;
	pointer-events: none;
}

:deep(.editor:not(.prosemirror)) {
	border: 1px solid var(--ironsworn-color-border, #ccc);
	border-radius: var(--ironsworn-border-radius-sm, 3px);
	padding: var(--ironsworn-spacer-xs, 2px) var(--ironsworn-spacer-sm, 4px);
	min-height: 2rem;
}
</style>
