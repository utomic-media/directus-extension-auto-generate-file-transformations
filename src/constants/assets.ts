import type { TransformationSet } from '../types';

//@see https://github.com/directus/directus/blob/main/api/src/constants.ts#L10
// NOTE: need to transform the format from the transformation[] to the TransformationSet[]
export const SYSTEM_ASSETS_TRANSFORMATIONS: TransformationSet[] = [
  {
    'transformationParams': {
      key: 'system-small-cover',
      format: 'auto',
      transforms: [['resize', { width: 64, height: 64, fit: 'cover' }]],
    }
  },
  {
    'transformationParams': {
      key: 'system-small-contain',
      format: 'auto',
      transforms: [['resize', { width: 64, fit: 'contain' }]],
    }
  },
  {
    'transformationParams': {
      key: 'system-medium-cover',
      format: 'auto',
      transforms: [['resize', { width: 300, height: 300, fit: 'cover' }]],
    }
  },
  {
    'transformationParams': {
      key: 'system-medium-contain',
      format: 'auto',
      transforms: [['resize', { width: 300, fit: 'contain' }]],
    }
  },
  {
    'transformationParams': {
      key: 'system-large-cover',
      format: 'auto',
      transforms: [['resize', { width: 800, height: 800, fit: 'cover' }]],
    }
  },
  {
    'transformationParams': {
      key: 'system-large-contain',
      format: 'auto',
      transforms: [['resize', { width: 800, fit: 'contain' }]],
    }
  },
];


// @see https://github.com/directus/directus/blob/main/api/src/constants.ts#L86
export const SUPPORTED_IMAGE_TRANSFORM_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'image/avif'];