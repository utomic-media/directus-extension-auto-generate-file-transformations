import { defineHook } from '@directus/extensions-sdk';
import { SYSTEM_ASSETS_TRANSFORMATION_SETS, SUPPORTED_IMAGE_TRANSFORM_FORMATS } from './constants/assets';
import { initDatabase } from './database/init';
import type { HookExtensionContext } from '@directus/extensions';
import type { TransformationSet, AutoTransformationSettings } from './types';

export default defineHook(({ action }, hookExtensionContext) => {

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

		const autoTransformationSettings = await getAutoTransformationSettings(hookExtensionContext);
		const customTransformationSets = autoTransformationSettings.transformationSet;
		const autoGenerateFileTransformations = autoTransformationSettings.autoGenerateFileTransformations;

		if (!autoGenerateFileTransformations || autoGenerateFileTransformations.length === 0) {
			// No transformations should be generated automatically
			return;
		}

		const allTransformationSets = setDefaultFormatForAutoFormats([...SYSTEM_ASSETS_TRANSFORMATION_SETS, ...customTransformationSets]);
		
		const selectedAutoTransformationSets = allTransformationSets.filter(transformationSet => {
			return transformationSet.transformationParams.key && autoGenerateFileTransformations.includes(transformationSet.transformationParams.key);
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
		transformationSet: transformationSet,
		autoGenerateFileTransformations: settings.extension_auto_generate_file_transformations,
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