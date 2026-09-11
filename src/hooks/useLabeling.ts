import { useState } from 'react'
import type { ImageReview } from '@/types'

export function useLabeling() {
  const [reviews, setReviews] = useState<Record<string, ImageReview>>({})

  function saveReview(review: ImageReview) {
    setReviews((current) => ({
      ...current,
      [review.imageId]: { ...review, updatedAt: new Date().toISOString() },
    }))
  }

  return { reviews, saveReview }
}
