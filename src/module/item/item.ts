import { createIronswornChatRoll } from '../chat/chatrollhelpers'
import { RANK_INCREMENTS } from '../constants'
import { EnhancedDataswornMove, moveDataByName } from '../helpers/data'
import { IronswornPrerollDialog } from '../rolls'
import {
  BondsetDataPropertiesData,
  ProgressDataPropertiesData,
} from './itemtypes'

/**
 * Extend the base Item entity
 * @extends {Item}
 */
export class IronswornItem extends Item {
  // Type hacks for v10 compatibility updates
  declare system: typeof this.data.data
  declare sort: typeof this.data.sort

  /**
   * Progress methods
   */
  markProgress(numMarks = 1) {
    if (this.type !== 'vow' && this.type !== 'progress') return
    const system = this.system as ProgressDataPropertiesData

    const increment = RANK_INCREMENTS[system.rank] * numMarks
    let newValue = system.current + increment
    newValue = Math.min(newValue, 40)
    newValue = Math.max(newValue, 0)
    return this.update({ 'system.current': newValue })
  }

  clearProgress() {
    if (this.data.type !== 'vow' && this.data.type !== 'progress') return
    return this.update({ 'system.current': 0 })
  }

  fulfill() {
    if (this.data.type !== 'progress') return
    const system = this.system as ProgressDataPropertiesData

    const progress = Math.floor(system.current / 4)
    return IronswornPrerollDialog.showForProgress(
      this.name || '(progress)',
      progress,
      this.actor || undefined,
      system.subtype === 'vow'
    )
  }

  /**
   * Bondset methods
   */

  async writeEpilogue() {
    if (this.type !== 'bondset') return
    const system = this.system as BondsetDataPropertiesData

    const move = await moveDataByName('Write Your Epilogue')
    if (!move) throw new Error('Problem loading write-epilogue move')

    const progress = Math.floor(Object.values(system.bonds).length / 4)
    const r = new Roll(`{${progress},d10,d10}`)
    createIronswornChatRoll({
      isProgress: true,
      move,
      roll: r,
      actor: this.actor || undefined,
    })
  }
}

declare global {
  interface DocumentClassConfig {
    Item: typeof IronswornItem
  }
}
