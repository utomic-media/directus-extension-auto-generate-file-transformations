export type TransformationParams = {
	key?: string;
	transforms?: Transformation[];
	format?: TransformationFormat | 'auto';
	quality?: number;
	focal_point_x?: number;
	focal_point_y?: number;
}

type Transformation = any;

type TransformationFormat = 'jpg' | 'jpeg' | 'png' | 'webp' | 'tiff' | 'avif';

export type TransformationSet = {
	transformationParams: TransformationParams;
	acceptFormat?: TransformationFormat | undefined;
};

export type AutoTransformationSettings = {
  transformationSet: TransformationSet[];
  autoGenerateFileTransformations: string[];
}