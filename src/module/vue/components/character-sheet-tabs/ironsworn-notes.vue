<template>
	<div class="flexcol">
		<RichEditor v-model="actor.system.biography" @save="immediateSave" />
	</div>
</template>

<script setup lang="ts">
import type { Ref } from 'vue'
import { inject } from 'vue'
import { $ActorKey, ActorKey } from '../../provisions'
import RichEditor from '../rich-editor.vue'

const actor = inject(ActorKey) as Ref
const $actor = inject($ActorKey)

const immediateSave = () => {
	$actor?.update({ 'system.biography': actor.value.system.biography })
}
</script>
