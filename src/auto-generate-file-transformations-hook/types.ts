import type { ResizeOptions } from 'sharp';

export type TransformationResize = Pick<ResizeOptions, 'width' | 'height' | 'fit' | 'withoutEnlargement'>;

export type TransformationParams = {
	key?: string;
	transforms?: Transformation[];
	format?: TransformationFormat | 'auto';
	quality?: number;
	focal_point_x?: number;
	focal_point_y?: number;
} & TransformationResize;

type Transformation = any;

type TransformationFormat = 'jpg' | 'jpeg' | 'png' | 'webp' | 'tiff' | 'avif';

export type TransformationSet = {
	transformationParams: TransformationParams;
	acceptFormat?: TransformationFormat | undefined;
};

export type AutoTransformationSettings = {
  customTransformationSets: TransformationSet[];
  transformationKeysToGenerate: string[];
}