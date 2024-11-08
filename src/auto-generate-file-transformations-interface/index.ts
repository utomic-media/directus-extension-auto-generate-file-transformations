import { defineInterface } from '@directus/extensions-sdk';
import InterfaceComponent from './interface.vue';

export default defineInterface({
	id: 'auto-generate-file-transformations-settings',
	name: 'Auto-generate file transformations settings',
	icon: 'crop',
	description: 'The settings interface for the "Auto-generate file transformations settings" extension!',
	component: InterfaceComponent,
	options: null,
	types: ['json'],
});
