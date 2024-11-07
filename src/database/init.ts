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
      interface: 'select-multiple-checkbox',
      options: {
        "fields": [
          {
            "meta": {
              "type": "string",
              "field": "key",
              "required": true,
              "interface": "input"
            },
            "name": "key",
            "type": "string",
            "field": "key"
          }
        ],
        "choices": [
          { "text": "system-small-cover", "value": "system-small-cover" },
          { "text": "system-small-contain", "value": "system-small-contain" },
          { "text": "system-medium-cover", "value": "system-medium-cover" },
          { "text": "system-medium-contain", "value": "system-medium-contain" },
          { "text": "system-large-cover", "value": "system-large-cover" },
          { "text": "system-large-contain", "value": "system-large-contain" }
        ],
        "allowOther": true
      },
    }
  } as Partial<Omit<Field, 'meta'>> & { field: string; type: Type | null; meta: Partial<FieldMeta>};

  await sudoFieldsService.createField('directus_settings', settingsField);
}