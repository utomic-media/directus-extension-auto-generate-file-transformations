import { defineHook } from '@directus/extensions-sdk';
import { SYSTEM_ASSETS_TRANSFORMATION_SETS, SUPPORTED_IMAGE_TRANSFORM_FORMATS } from './constants/assets';
import { initDatabase } from './database/init';
import type { HookExtensionContext } from '@directus/extensions';
import type { TransformationSet, AutoTransformationSettings, TransformationParams } from './types';

export default defineHook(({ filter, action }, hookExtensionContext) => {

	// Initialize the database on server-start
	action('server.start', async () => {
		await initDatabase(hookExtensionContext);
	});
	

	// Create transformations on file upload
	// This is also triggered on file-patch
	action('files.upload', async ({ payload, key }) => {
		if (!payload || !payload.type || !SUPPORTED_IMAGE_TRANSFORM_FORMATS.includes(payload.type)) {
			// Can't create transformations for these files
			return;
		}

		const { customTransformationSets, transformationKeysToGenerate } = await getAutoTransformationSettings(hookExtensionContext);

		if (!transformationKeysToGenerate || transformationKeysToGenerate.length === 0) {
			// No transformations should be generated automatically
			return;
		}

		const allTransformationSets = setDefaultFormatForAutoFormats([...SYSTEM_ASSETS_TRANSFORMATION_SETS, ...customTransformationSets]);
		
		const selectedAutoTransformationSets = allTransformationSets.filter(transformationSet => {
			return transformationSet.transformationParams.key && transformationKeysToGenerate.includes(transformationSet.transformationParams.key);
		});

		const sudoAssetsService = new hookExtensionContext.services.AssetsService({
			schema: await hookExtensionContext.getSchema(),
		});

		// While we could process them in parallel, we decided to generate them in sequence to avoid overloading the server
		for (const transformationSet of selectedAutoTransformationSets) {
			try {
				await sudoAssetsService.getAsset(key, transformationSet);
				hookExtensionContext.logger.info(`[AutoGenerateFileTransformations] Auto generated transformation: ${transformationSet.transformationParams.key} for file ${key}`);
			} catch (error) {
				hookExtensionContext.logger.error(`[AutoGenerateFileTransformations] Error while Auto-generating file transformation: ${transformationSet.transformationParams.key} for file ${key}`, error);
				hookExtensionContext.logger.error(error);
			}
		}
	});


	// On deletion of a transformation preset also remove it from the auto-generation-selection, if it's selected
	filter('settings.update', async (item: Record<string, any>, { keys }) => {
		if (!item.storage_asset_presets) {
			return item;
		}
		
		try {
			item.extension_auto_generate_file_transformations = await getNewSelectedAutoGenerateFileTransformationKeys(hookExtensionContext, item.storage_asset_presets);
			return item;
		} catch (error) {
			// Prevents the settings from boiung updated, as we failed to remove the preset from the selection
			throw new Error('[AutoGenerateFileTransformations] Failed to remove the preset from your selection');
		}
	})
	
});


/**
 * Get the custom transformations from the settings
 */
async function getAutoTransformationSettings(hookExtensionContext: HookExtensionContext): Promise<AutoTransformationSettings> {
	const sudoSettingsService = new hookExtensionContext.services.SettingsService({
		schema: await hookExtensionContext.getSchema(),
	});

	const settings = (await sudoSettingsService.readSingleton({}));
	const transformationSet = settings.storage_asset_presets
		? settings.storage_asset_presets.map((preset: any) => { return { 'transformationParams': preset } })
		: []


	return {
		customTransformationSets: transformationSet,
		transformationKeysToGenerate: settings.extension_auto_generate_file_transformations,
	};
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


/**
 * Get's the new value for the auto-generate-file-transformations setting after a preset was deleted
 * (removs non-existing presets from the selection)
 */
async function getNewSelectedAutoGenerateFileTransformationKeys(
	hookExtensionContext: HookExtensionContext,
	transformations: TransformationParams[]
):Promise<string[]> {
	const newCustomTransformationKeys = transformations.map(transformation => transformation.key);
	const systemTransformationKeys = SYSTEM_ASSETS_TRANSFORMATION_SETS.map(transformationSet => transformationSet.transformationParams.key);
	const allTransformationKeys = [...newCustomTransformationKeys, ...systemTransformationKeys];

	const { transformationKeysToGenerate } = await getAutoTransformationSettings(hookExtensionContext);

	return transformationKeysToGenerate.filter(key => allTransformationKeys.includes(key));
}