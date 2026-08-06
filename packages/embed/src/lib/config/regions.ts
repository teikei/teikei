export interface RegionDefinition {
	code: string;
	label: string;
	bounds: [number, number, number, number];
}

export const REGION_CATALOG: Record<string, RegionDefinition[]> = {
	DE: [
		{ code: 'BW', label: 'Baden-Wuerttemberg', bounds: [7.5, 47.5, 10.5, 49.8] },
		{ code: 'BY', label: 'Bayern', bounds: [8.9, 47.2, 13.9, 50.6] },
		{ code: 'BE', label: 'Berlin', bounds: [13.0, 52.3, 13.8, 52.7] },
		{ code: 'BB', label: 'Brandenburg', bounds: [11.3, 51.3, 14.8, 53.6] },
		{ code: 'HB', label: 'Bremen', bounds: [8.4, 53.0, 8.95, 53.3] },
		{ code: 'HH', label: 'Hamburg', bounds: [9.7, 53.4, 10.3, 53.8] },
		{ code: 'HE', label: 'Hessen', bounds: [7.7, 49.4, 10.3, 51.7] },
		{ code: 'MV', label: 'Mecklenburg-Vorpommern', bounds: [10.6, 53.0, 14.4, 54.7] },
		{ code: 'NI', label: 'Niedersachsen', bounds: [6.3, 51.2, 11.8, 53.9] },
		{ code: 'NW', label: 'Nordrhein-Westfalen', bounds: [5.8, 50.3, 9.5, 52.6] },
		{ code: 'RP', label: 'Rheinland-Pfalz', bounds: [6.0, 48.9, 8.6, 50.9] },
		{ code: 'SL', label: 'Saarland', bounds: [6.3, 49.1, 7.5, 49.7] },
		{ code: 'SN', label: 'Sachsen', bounds: [11.8, 50.1, 15.1, 51.7] },
		{ code: 'ST', label: 'Sachsen-Anhalt', bounds: [10.5, 50.9, 13.3, 53.1] },
		{ code: 'SH', label: 'Schleswig-Holstein', bounds: [8.3, 53.3, 11.3, 55.1] },
		{ code: 'TH', label: 'Thueringen', bounds: [9.8, 50.2, 12.7, 51.7] }
	],
	AT: [
		{ code: 'BGL', label: 'Burgenland', bounds: [15.6, 46.8, 17.2, 48.1] },
		{ code: 'K', label: 'Kaernten', bounds: [12.6, 46.4, 15.1, 47.1] },
		{ code: 'NOE', label: 'Niederoesterreich', bounds: [14.4, 47.4, 17.1, 49.1] },
		{ code: 'OOE', label: 'Oberoesterreich', bounds: [12.7, 47.4, 14.9, 49.1] },
		{ code: 'S', label: 'Salzburg', bounds: [12.1, 46.6, 13.9, 47.8] },
		{ code: 'ST', label: 'Steiermark', bounds: [13.3, 46.6, 16.1, 48.0] },
		{ code: 'T', label: 'Tirol', bounds: [10.1, 46.6, 12.9, 47.8] },
		{ code: 'V', label: 'Vorarlberg', bounds: [9.5, 46.8, 10.3, 47.6] },
		{ code: 'W', label: 'Wien', bounds: [16.1, 48.1, 16.6, 48.4] }
	],
	CH: [
		{ code: 'AG', label: 'Aargau', bounds: [7.75, 47.16, 8.45, 47.62] },
		{ code: 'AI', label: 'Appenzell Innerrhoden', bounds: [9.34, 47.25, 9.5, 47.45] },
		{ code: 'AR', label: 'Appenzell Ausserrhoden', bounds: [9.23, 47.3, 9.62, 47.47] },
		{ code: 'BE', label: 'Bern', bounds: [6.85, 46.34, 8.48, 47.83] },
		{ code: 'BL', label: 'Basel-Landschaft', bounds: [7.33, 47.34, 7.97, 47.58] },
		{ code: 'BS', label: 'Basel-Stadt', bounds: [7.55, 47.52, 7.64, 47.6] },
		{ code: 'FR', label: 'Fribourg', bounds: [6.74, 46.48, 7.39, 47.17] },
		{ code: 'GE', label: 'Geneve', bounds: [5.96, 46.12, 6.3, 46.37] },
		{ code: 'GL', label: 'Glarus', bounds: [8.83, 46.75, 9.25, 47.18] },
		{ code: 'GR', label: 'Graubuenden', bounds: [8.65, 46.17, 10.49, 47.56] },
		{ code: 'JU', label: 'Jura', bounds: [6.83, 47.16, 7.56, 47.51] },
		{ code: 'LU', label: 'Luzern', bounds: [7.8, 46.78, 8.53, 47.29] },
		{ code: 'NE', label: 'Neuchatel', bounds: [6.49, 46.83, 7.15, 47.27] },
		{ code: 'NW', label: 'Nidwalden', bounds: [8.2, 46.79, 8.58, 47.1] },
		{ code: 'OW', label: 'Obwalden', bounds: [7.82, 46.71, 8.35, 47.03] },
		{ code: 'SG', label: 'St. Gallen', bounds: [8.67, 46.97, 10.24, 47.58] },
		{ code: 'SH', label: 'Schaffhausen', bounds: [8.38, 47.58, 8.97, 47.81] },
		{ code: 'SO', label: 'Solothurn', bounds: [7.34, 47.16, 8.03, 47.51] },
		{ code: 'SZ', label: 'Schwyz', bounds: [8.43, 46.9, 9.02, 47.22] },
		{ code: 'TG', label: 'Thurgau', bounds: [8.74, 47.38, 9.46, 47.7] },
		{ code: 'TI', label: 'Ticino', bounds: [8.38, 45.82, 9.16, 46.64] },
		{ code: 'UR', label: 'Uri', bounds: [8.36, 46.58, 8.98, 47.15] },
		{ code: 'VD', label: 'Vaud', bounds: [5.95, 46.2, 7.15, 47.02] },
		{ code: 'VS', label: 'Valais', bounds: [6.77, 45.82, 8.48, 46.63] },
		{ code: 'ZG', label: 'Zug', bounds: [8.37, 47.08, 8.72, 47.25] },
		{ code: 'ZH', label: 'Zuerich', bounds: [8.5, 47.2, 8.95, 47.65] }
	]
};
