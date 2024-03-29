'use client'
import { createSelectors } from '@/store/createSelectors'
import { AudioDialogSlice, createAudioDialogSlice } from './audio-dialog'
import { createSearchSlice, SearchSlice } from './search'
import { TaskContextSlice, createTaskContextSlice } from './task-context'
import { create, type StateCreator } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { createTaskActionSlice, TaskActionSlice } from '@/app/video-tasks/_store/task-action'

export type ImmerStateCreator<T> = StateCreator<T, [['zustand/immer', never], never], [], T>

type BoundStore = AudioDialogSlice & TaskContextSlice & SearchSlice & TaskActionSlice
export const useBoundStoreBase = create<BoundStore>()(
  immer((...a) => ({
    ...createAudioDialogSlice(...a),
    ...createTaskContextSlice(...a),
    ...createSearchSlice(...a),
    ...createTaskActionSlice(...a),
  })),
)

export const useBoundStore = createSelectors(useBoundStoreBase)
