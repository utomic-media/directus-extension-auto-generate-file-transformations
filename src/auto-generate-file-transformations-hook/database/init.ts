import { HookExtensionContext } from "@directus/extensions";
import type { Field, Type, FieldMeta } from '@directus/types';

export async function initDatabase(hookExtensionContext: HookExtensionContext) {
  try {
    await createSettingsField(hookExtensionContext);
  } catch (err) {
    hookExtensionContext.logger.error('[AutoGenerateFileTransformations] Error while initializing the database:');
    hookExtensionContext.logger.error(err);
  }
  
}


async function createSettingsField(hookExtensionContext: HookExtensionContext) {
  const hasField = await hookExtensionContext.database.schema.hasColumn('directus_settings', 'extension_auto_generate_file_transformations');
  
  if (hasField) {
    return;
  }

  const sudoFieldsService = new hookExtensionContext.services.FieldsService({
    schema: await hookExtensionContext.getSchema(),
  });

  const settingsField = {
    field: 'extension_auto_generate_file_transformations',
    type: 'json',
    meta: {
      special: ["cast-json"],
      note: 'On file-upload the extension will auto-generate all selected transformations.',
      interface: 'auto-generate-file-transformations-settings',
    }
  } as Partial<Omit<Field, 'meta'>> & { field: string; type: Type | null; meta: Partial<FieldMeta>};

  await sudoFieldsService.createField('directus_settings', settingsField);
}