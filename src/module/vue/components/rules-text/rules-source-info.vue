<template>
	<span class="rules-source-info" aria-label="Source">
		<cite v-if="props.source.url"
			><a :href="props.source.url" target="_blank">{{
				props.source.title
			}}</a></cite
		>
		<cite v-else>{{ source.title }}</cite
		>{{ pageText }}
	</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Datasworn } from '@datasworn-community/core'
type SourceInfo = Datasworn.SourceInfo

const props = defineProps<{ source: SourceInfo }>()

const pageText = computed(() => {
	if (!props.source.page) {
		return ''
	}
	return (
		', ' +
		game.i18n.format('IRONSWORN.PageReference', { page: props.source.page })
	)
})
</script>
