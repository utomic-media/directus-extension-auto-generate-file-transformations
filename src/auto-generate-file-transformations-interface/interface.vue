<script setup lang="ts">
import { computed, PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStores } from '@directus/extensions-sdk';

const props = defineProps({
	value: {
		type: Array as PropType<String[]> | null,
	},
});

const { t } = useI18n();
const { useSettingsStore } = useStores();

const settingsStore = useSettingsStore();

const systemTransformations = [
  { "text": "system-small-cover", "value": "system-small-cover" },
  { "text": "system-small-contain", "value": "system-small-contain" },
  { "text": "system-medium-cover", "value": "system-medium-cover" },
  { "text": "system-medium-contain", "value": "system-medium-contain" },
  { "text": "system-large-cover", "value": "system-large-cover" },
  { "text": "system-large-contain", "value": "system-large-contain" }
];

const allTransformations = computed(() => {
	if (!settingsStore.settings.storage_asset_presets) {
		return systemTransformations;
	}

	const customTransformations = settingsStore.settings.storage_asset_presets.map((preset) => ({
		text: preset.key,
		value: preset.key,
	}));
	return [...systemTransformations, ...customTransformations];
});

const displayAutoFormatNotice = computed(() => {
	if (!props.value) {
		return false;
	}

	return props.value.find((transformationKey) => {
		// check if transformation is a system transformation or if it's a custom transformation with format 'auto'
		const isSystemTransformation = systemTransformations.some((transformation) => transformation.value === transformationKey);
		const isAutoTransformation = settingsStore.settings.storage_asset_presets && settingsStore.settings.storage_asset_presets.some((preset) => preset.key === transformationKey && preset.format === 'auto');
		return isSystemTransformation || isAutoTransformation;
	});
});

</script>



<template>
	<v-notice v-if="!allTransformations" type="warning">
		{{ t('choices_option_configured_incorrectly') }}
	</v-notice>
	<div
		v-else
		class="transformation-checkboxes"
	>
		<v-checkbox
			v-for="item in allTransformations"
			:key="item.value"
			block
			icon-on="check_box"
			icon-off="check_box_outline_blank"
			:value="item.value"
			:label="item.text"
			:model-value="value || []"
			@update:model-value="$emit('input', $event)"
		/>
	</div>
	
	<VNotice v-if="displayAutoFormatNotice">
		You have selected one or more transformations with "auto" format. For these, the extension will generate AVIF versions (matching Directus primary format preference)
	</VNotice>
</template>




<style scoped lang="scss">
.transformation-checkboxes {
	--columns: 1;

	/* Align with directus select-multiple-checkbox.vue two-columns styles */
	display: grid;
	grid-gap: 12px 32px;
	grid-template-columns: repeat(var(--columns), minmax(0, 1fr));

	@media (min-width: 600px) {
		--columns: 2;
	}
}

.v-notice {
	margin-top: 1rem;
}
</style>