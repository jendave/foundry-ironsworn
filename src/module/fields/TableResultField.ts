import type { TableResultDataConstructorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/tableResultData'
import type { LegacyTableRow } from '../roll-table/roll-table-types'

export type TableResultStub = Omit<
	TableResultDataConstructorData,
	'weight' | '_id' | 'collection' | 'resultId' | 'drawn'
>

/** A field containing TableResult constructor data, used to generic dynamic RollTables like those used for delve site denizens, features, and dangers. */
// Now a legacy type because Foundry v12 changed the types
export class V11TableResultField extends foundry.data.fields
	.SchemaField<TableResultStub> {
	constructor(options?: Partial<TableResultField.Options>) {
		const fields = foundry.data.fields
		// based on BaseTableResult#defineSchema
		super({
			type: new fields.StringField({
				initial: CONST.TABLE_RESULT_TYPES.DOCUMENT as any,
				validationError: 'must be a value in CONST.TABLE_RESULT_TYPES',
			}) as any,
			text: new fields.HTMLField({ required: false }),
			img: new fields.FilePathField({ categories: ['IMAGE'] }),

			range: new fields.ArrayField(new fields.NumberField({ integer: true }), {
				initial: options?.staticRange ?? undefined,
				readonly: Boolean(options?.staticRange),
				required: Boolean(options?.staticRange),
				validate: (range: [number, number]) =>
					range.length === 2 && range[1] >= range[0],
				validationError: 'must be a length-2 array of ascending integers'
			}),
			// the typings infer this more strictly, but internally, this is consistent with every other flag field
			flags: new fields.ObjectField({ required: false }) as any
		})

		// Foundry v14 renamed `DataField#migrateSource` to `#_migrate` and warns if
		// `migrateSource` is defined as a method. v13 still calls `migrateSource`
		// and has no `_migrate`. To support both without the deprecation warning,
		// `_migrate` is defined below for v14, and `migrateSource` is attached as an
		// instance property only on v13 (after super(), so v14's constructor check
		// sees no `migrateSource`).
		const supportsMigrate =
			typeof (foundry.data.fields.DataField.prototype as any)._migrate ===
			'function'
		if (!supportsMigrate) {
			;(this as any).migrateSource = (
				sourceData: unknown,
				fieldData: TableResultDataConstructorData
			) => this._migrateTableResult(sourceData, fieldData)
		}
	}

	/** v14 migration hook. `_state.modelSource` is the legacy source object. */
	_migrate(value: any, _options: unknown, _state: { modelSource?: unknown }) {
		this._migrateTableResult(_state?.modelSource, value)
		return value
	}

	/** Shared migration logic for the legacy `{ low, high, text }` row shape. */
	protected _migrateTableResult(
		sourceData: unknown,
		fieldData: TableResultDataConstructorData
	) {
		if (foundry.utils.hasProperty(sourceData as object, 'low')) {
			const legacyRowData = sourceData as LegacyTableRow
			fieldData.range = [legacyRowData.low, legacyRowData.high]
			fieldData.text = legacyRowData.text ?? legacyRowData.description
		}
		if ((fieldData?.type as unknown) === '0') {
			fieldData.type = CONST.TABLE_RESULT_TYPES.DOCUMENT
		}
		return fieldData
	}
}
export interface V11TableResultField
	extends foundry.data.fields.SchemaField<TableResultStub> {}
export namespace TableResultField {
	export interface Options
		extends foundry.data.fields.DataField.Options<TableResultStub> {
		/** Set a readonly `range` for this table result */
		staticRange: [number, number]
	}
}
