/* eslint-disable @typescript-eslint/triple-slash-reference */
/**
 * Ambient shims that teach the v9/v10-era foundry-vtt-types package about the
 * v13+ Foundry surface area that this codebase actually uses. These are
 * deliberately loose (`any`) — the goal is to silence known-safe divergences
 * so the rest of the codebase stays typecheckable, not to restore full type
 * safety. If/when the project migrates to a modern foundry-vtt-types fork,
 * delete this file.
 */

export {}

declare global {
	// A class whose constructor accepts arbitrary arguments. Plain `any` doesn't
	// work here: `class Foo extends AnyTypedThing` collapses to a zero-arg
	// constructor signature, so `extends`-able ambient values need this shape
	// instead.
	type AnyClassConstructor = { new (...args: any[]): any; [k: string]: any }

	// v13 namespaces / re-homed APIs --------------------------------------------
	namespace foundry {
		const appv1: {
			sheets: {
				JournalTextPageSheet: any
				JournalPageSheet: any
				ActorSheet: any
				ItemSheet: any
				[k: string]: any
			}
			[k: string]: any
		}

		const applications: {
			apps: { DocumentSheetConfig: any; [k: string]: any }
			sheets: {
				ActorSheetV2: AnyClassConstructor
				ItemSheetV2: AnyClassConstructor
				journal: {
					JournalEntryPageHandlebarsSheet: any
					JournalEntryPageSheet: any
					JournalEntryPageTextSheet: any
					[k: string]: any
				}
				[k: string]: any
			}
			api: {
				ApplicationV2: AnyClassConstructor
				HandlebarsApplicationMixin: (Base: AnyClassConstructor) => AnyClassConstructor
				[k: string]: any
			}
			sidebar: Record<string, any>
			ux: Record<string, any>
			[k: string]: any
		}

		namespace documents {
			const collections: {
				Actors: {
					registerSheet: (...args: any[]) => void
					unregisterSheet: (...args: any[]) => void
				}
				Items: {
					registerSheet: (...args: any[]) => void
					unregisterSheet: (...args: any[]) => void
				}
				[k: string]: any
			}
		}

		const canvas: {
			layers: { [k: string]: any }
			[k: string]: any
		}

		const nue: {
			Tour: typeof Tour & (new (config?: any, options?: any) => Tour)
		}

		const dice: {
			terms: {
				DieTerm: any
				Die: typeof Die
				[k: string]: any
			}
			[k: string]: any
		}
	}

	// v13 Tour API --------------------------------------------------------------
	interface Tour {
		currentStep: any
		start(): Promise<void> | void
		reset(): Promise<void> | void
		config: any
	}


	// v13 SceneControl(Tool) shape ----------------------------------------------
	interface SceneControlToolBase {
		onChange?: (...args: any[]) => any
	}

	interface SceneControl {
		tools: any
	}

	// v13 utility ---------------------------------------------------------------
	namespace foundry.utils {
		function parseUuid(uuid: string, options?: any): any
	}

	// v13 JournalEntryPage game.documentTypes registry --------------------------
	interface Game {
		documentTypes: {
			JournalEntryPage?: Record<string, any>
			[k: string]: any
		}
		release: {
			generation: number
			[k: string]: any
		}
	}
}

// v12+ chat message styles (renamed from CHAT_MESSAGE_TYPES) -----------------
declare module '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/constants.mjs' {
	export const CHAT_MESSAGE_STYLES: Readonly<{
		OTHER: 0
		OOC: 1
		IC: 2
		EMOTE: 3
		WHISPER: 4
		ROLL: 5
	}>
}
