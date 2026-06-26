<template>
	<div class="flexrow" :class="$style.root">
		<div class="flexcol" :class="$style.col">
			<section class="sheet-area flexcol" :class="$style.col">
				<!-- Bonds -->
				<Bonds :compact-progress="true" data-tourid="bonds" />

				<hr class="nogrow" />
				<!-- Assets -->
				<PlayerAssets data-tourid="assets" :class="$style.assets">
					<template #start>
						<h4 class="nogrow" :class="$style.h4">
							{{ $t('IRONSWORN.ITEMS.TypeAsset') }}
						</h4>
					</template>
				</PlayerAssets>
			</section>
		</div>
		<ActiveCompletedProgresses
			:compact-progress="true"
			:class="[$style.col, $style.progress]"
			data-tourid="progress" />
	</div>
</template>
<script lang="ts" setup>
import Bonds from 'component:bonds.vue'
import ActiveCompletedProgresses from 'component:progress/active-completed-progresses.vue'
import PlayerAssets from 'component:asset/player-assets.vue'
</script>
<style lang="scss" module>
.root {
	flex: 1 1 0;
	min-height: 0;
}

.col {
	flex: 1 1 0;
	min-height: 0;
}

.assets {
	flex: 1 1 0;
	min-height: 0;
}

.progress {
	margin-top: var(--ironsworn-spacer-md);
}

.h4 {
	text-transform: uppercase;
	font-size: var(--font-size-16);
}
</style>
