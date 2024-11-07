import { defineHook } from '@directus/extensions-sdk';
import { SYSTEM_ASSETS_TRANSFORMATION_SETS, SUPPORTED_IMAGE_TRANSFORM_FORMATS } from './constants/assets';
import type { HookExtensionContext } from '@directus/extensions';
import type { TransformationSet } from './types';

export default defineHook(({ action }, hookExtensionContext) => {
	
	// Create transformations on file upload
	// This is also triggered on file-patch
	action('files.upload', async ({ payload, key }) => {
		if (!payload || !payload.type || !SUPPORTED_IMAGE_TRANSFORM_FORMATS.includes(payload.type)) {
			// Can't create transformations for these files
			return;
		}

		const sudoAssetsService = new hookExtensionContext.services.AssetsService({
			schema: await hookExtensionContext.getSchema(),
		});

		const customTransformationSets = await getCustomTransformations(hookExtensionContext);
		const allTransformationSets = setDefaultFormatForAutoFormats([...SYSTEM_ASSETS_TRANSFORMATION_SETS, ...customTransformationSets]);

		// While we could process them in parallel, we decided to generate them in sequence to avoid overloading the server
		for (const transformationSet of allTransformationSets) {
			try {
				await sudoAssetsService.getAsset(key, transformationSet);
				hookExtensionContext.logger.info(`[AutoGenerateFileTransformations] Auto generated transformation: ${transformationSet.transformationParams.key} for file ${key}`);
			} catch (error) {
				hookExtensionContext.logger.error(`[AutoGenerateFileTransformations] Error while Auto-generating file transformation: ${transformationSet.transformationParams.key} for file ${key}`, error);
				hookExtensionContext.logger.error(error);
			}
		}
	});
});


/**
 * Get the custom transformations from the settings
 */
async function getCustomTransformations(hookExtensionContext: HookExtensionContext): Promise<TransformationSet[]> {
	const sudoSettingsService = new hookExtensionContext.services.SettingsService({
		schema: await hookExtensionContext.getSchema(),
	});

	const settings = (await sudoSettingsService.readSingleton({}));

	if (!settings.storage_asset_presets) {
		return [];
	}

	return settings.storage_asset_presets.map((preset: any) => {  return { 'transformationParams': preset } });;
}


/**
 * Takes a list of transformations and replaces the format 'auto' with the first of directus preferred format
 */
function setDefaultFormatForAutoFormats(transformations: TransformationSet[]): TransformationSet[] {
	// Directus currently uses 'avif' as the first preferred format
	return transformations.map(transformation => {
		if (transformation.transformationParams.format === 'auto') {
			transformation.transformationParams.format = 'avif';
		}
		return transformation;
	});
}