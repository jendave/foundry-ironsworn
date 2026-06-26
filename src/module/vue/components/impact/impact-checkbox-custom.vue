<template>
	<div class="flexrow" :class="$style.wrapper">
		<IronCheckbox
			is="button"
			type="button"
			class="nogrow"
			:checked="actor.system.debility[debilitykey]"
			:transition="IronswornSettings.deco.impact.transition"
			@change="toggleImpact">
			<template #checked="scope">
				<FontIcon v-bind="{ ...scope, ...IronswornSettings.deco.impact.checked }" />
			</template>
			<template #unchecked="scope">
				<FontIcon v-bind="{ ...scope, ...IronswornSettings.deco.impact.unchecked }" />
			</template>
		</IronCheckbox>
		<input
			v-model="actor.system.debility[labelKey]"
			:class="$style.input"
			type="text"
			@input="nameUpdate" />
	</div>
</template>

<script lang="ts" setup>
import { throttle } from 'lodash-es'
import type { Ref } from 'vue'
import { computed, inject } from 'vue'
import { $ActorKey, ActorKey } from '../../provisions'
import IronCheckbox from '../input/iron-checkbox.vue'
import FontIcon from '../icon/font-icon.vue'
import { IronswornSettings } from '../../../helpers/settings'

const props = defineProps<{
	debilitykey: string
	type: 'debility' | 'impact'
}>()

const actor = inject(ActorKey) as Ref
const $actor = inject($ActorKey)

const labelKey = computed(() => `${props.debilitykey}name`)

async function toggleImpact(value: boolean) {
	await $actor?.update({ [`system.debility.${props.debilitykey}`]: value })
}

async function immediateNameUpdate() {
	const nk = labelKey.value
	await $actor?.update({
		[`system.debility.${nk}`]: actor.value.system.debility[nk]
	})
}
const nameUpdate = throttle(immediateNameUpdate, 1000)
</script>

<style lang="scss" module>
.wrapper {
	text-align: start;
	align-items: center;
	gap: var(--ironsworn-spacer-sm);

	// match the button sizing to the impact checkbox items above
	button {
		min-height: 0;
		height: auto;
		padding: var(--ironsworn-spacer-xs);
		padding-left: 0;
	}
}
.input {
	flex: 1;
	min-width: 0;
	outline: 0;
	border: 0;
	border-bottom: var(--ironsworn-border-width-md) solid;
	text-align: start !important;
	&:hover {
		box-shadow: none !important;
	}
}
</style>
