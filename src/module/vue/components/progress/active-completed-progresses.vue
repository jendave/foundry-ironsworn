<template>
	<article class="flexcol" :class="$style.wrapper">
		<DropTarget
			:is="ProgressList"
			drop-type="progress"
			:compact-progress="compactProgress"
			:excluded-subtypes="excludedSubtypes"
			:progress-stars="progressStars"
			:show-completed="'no-completed'"
			:class="$style.list"
		/>
		<ProgressControls class="nogrow" />
		<CompletedProgressList
			class="nogrow"
			:collapsible-props="{ toggleWrapperIs: 'h3' }"
		/>
	</article>
</template>

<script setup lang="ts">
import ProgressControls from 'component:progress/progress-controls.vue'
import ProgressList from 'component:progress/progress-list.vue'
import DropTarget from '../../drop-target.vue'
import CompletedProgressList from 'component:progress/completed-progress-list.vue'

defineProps<{
	/**
	 * List of progress subtypes to exclude from the list. To leave out
	 * connections, pass `['bond']` here.
	 */
	excludedSubtypes?: string[]
	progressStars?: boolean
	/**
	 * When true, renders the progress bars for more compact display.
	 */
	compactProgress?: boolean
}>()
</script>

<style lang="scss" module>
.wrapper {
	flex: 1 1 0;
	min-height: 0;
}

.list {
	flex: 1 1 0;
	min-height: 0;
	overflow-y: auto;
}
</style>
