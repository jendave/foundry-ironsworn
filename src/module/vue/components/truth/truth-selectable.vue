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
		<div class="flexcol">
			<p v-if="pageSystem.Summary">
				<strong>{{ pageSystem.Summary }}</strong>
			</p>

			<RenderedText
				element="div"
				:markdown="true"
				:content="pageSystem.Description"
			/>

			<section v-if="page.subtable" class="flexcol subtable">
				<div
					v-for="(entry, i) in page.subtable.results"
					:key="`subtableRow${i}`"
					class="flexrow nogrow subtable-row"
					@click="subtableSelect(entry)"
				>
					<IronCheckbox
						class="nogrow truth-radio subtable-radio"
						:checked="suboption === entry.description">
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
					<p v-html="entry.description" />
				</div>

				<!-- TODO: custom input -->
			</section>

			<RenderedText
				class="quest"
				element="div"
				:markdown="true"
				:content="pageSystem.Quest"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { IronswornJournalPage } from '../../../journal/journal-entry-page'
import type { TruthOptionDataPropertiesData } from '../../../journal/journal-entry-page-types'
import { OracleTableResult } from '../../../roll-table/oracle-table-result'
import RenderedText from 'component:rendered-text.vue'
import IronCheckbox from '../input/iron-checkbox.vue'
import FontIcon from '../icon/font-icon.vue'
import { FontAwesome } from '../icon/icon-common'

const props = defineProps<{
	page: IronswornJournalPage<'truth'>
	radioGroup: string
	selected?: boolean
}>()
const pageSystem = props.page.system as TruthOptionDataPropertiesData

function select() {
	$emit('select')
	emitValue()
}

const suboption = ref<string | undefined>()
function subtableSelect(entry: OracleTableResult) {
	suboption.value = entry.description
	$emit('select')
	emitValue()
}

const $emit = defineEmits<{
	select: []
	change: [string, string] // title, text
}>()
function emitValue() {
	// Some pages (i.e. Classic) don't have a title
	let title = props.page.name ?? ''
	if (title?.startsWith('truth.option')) {
		title = ''
	}

	let text = `${pageSystem.Description} ${suboption.value ?? ''}\n\n_${
		pageSystem.Quest
	}_`

	const template = pageSystem['Roll template']
	if (suboption.value && template?.Description) {
		text =
			template.Description.replace(/{{table>.*?}}/, `> ${suboption.value}`) +
			`\n\n_${pageSystem.Quest}_`
	}
	$emit('change', title, text.trim())
}

async function selectAndRandomize() {
	$emit('select')

	if (
		props.page.subtable &&
		((props.page.subtable?.results as any)?.size ?? 0) > 0
	) {
		const { roll } = await props.page.subtable.draw()

		if (!roll || !roll.total) return

		const selectedEntry = props.page.subtable.results.contents.find((row) =>
			row.hasInRange(roll.total as number)
		)
		if (selectedEntry) suboption.value = selectedEntry.description
	}

	emitValue()
}

defineExpose({ selectAndRandomize })
</script>

<style lang="scss" scoped>
.truth-radio {
	flex-grow: 0;
	flex-shrink: 0;
	flex-basis: var(--checkbox-size, 1.25rem);
	align-self: flex-start;
	margin: var(--ironsworn-spacer-lg);
	width: var(--checkbox-size, 1.25rem);
	height: var(--checkbox-size, 1.25rem);
	min-width: var(--checkbox-size, 1.25rem);
}

.subtable-row {
	align-items: center;
	gap: var(--ironsworn-spacer-md);
	cursor: pointer;

	p {
		margin: 0;
	}
}

.subtable-radio {
	margin: 0;
	align-self: center;
}

.quest {
	font-style: italic;
}
</style>
