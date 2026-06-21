'use client'

import { nanoid } from 'nanoid'

export const USER_ID_STORAGE_KEY = 'userId'

export const LocalStorage = {
  createUserId: () => {
    const existingUserId = localStorage.getItem(USER_ID_STORAGE_KEY)

    if (existingUserId) {
      return
    }

    const newUserId = `User-${nanoid(10)}`
    localStorage.setItem(USER_ID_STORAGE_KEY, newUserId)
    const event = new CustomEvent('create-user-id', {
      detail: {
        userId: newUserId
      }
    })

    window.dispatchEvent(event)
  },
  getUserId: () => {
    return localStorage.getItem(USER_ID_STORAGE_KEY)
  }
}
