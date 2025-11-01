import {
  SegmentStructure,
  SegmentDefinition,
  FormatDriftAnalysis,
  DriftChange,
} from '@/types/debate'

/**
 * Calculates how much a debate's segment structure has drifted from its original format template
 */
export function calculateFormatDrift(
  currentSegments: SegmentStructure | null | undefined,
  templateSegments: SegmentStructure | null | undefined,
  templateName?: string
): FormatDriftAnalysis {
  // No template = custom format, no drift
  if (!templateSegments || templateSegments.length === 0) {
    return {
      isDrifted: false,
      driftPercentage: 100,
      hasTemplate: false,
      changes: [],
      addedSegments: [],
      removedSegments: [],
      modifiedSegments: [],
    }
  }

  // Has template but no current segments (shouldn't happen, but handle it)
  if (!currentSegments || currentSegments.length === 0) {
    return {
      isDrifted: true,
      driftPercentage: 0,
      hasTemplate: true,
      templateName,
      changes: templateSegments.map((seg) => ({
        type: 'removed' as const,
        segmentKey: seg.key,
        description: `Removed segment: "${seg.title}"`,
      })),
      addedSegments: [],
      removedSegments: [...templateSegments],
      modifiedSegments: [],
    }
  }

  const changes: DriftChange[] = []
  const addedSegments: SegmentDefinition[] = []
  const removedSegments: SegmentDefinition[] = []
  const modifiedSegments: SegmentDefinition[] = []

  // Create maps for quick lookup
  const templateMap = new Map(templateSegments.map((seg) => [seg.key, seg]))
  const currentMap = new Map(currentSegments.map((seg) => [seg.key, seg]))

  // Check for removed segments
  for (const templateSeg of templateSegments) {
    if (!currentMap.has(templateSeg.key)) {
      removedSegments.push(templateSeg)
      changes.push({
        type: 'removed',
        segmentKey: templateSeg.key,
        description: `Removed segment: "${templateSeg.title}"`,
      })
    }
  }

  // Check for added and modified segments
  for (const currentSeg of currentSegments) {
    const templateSeg = templateMap.get(currentSeg.key)

    if (!templateSeg) {
      // New segment added
      addedSegments.push(currentSeg)
      changes.push({
        type: 'added',
        segmentKey: currentSeg.key,
        description: `Added segment: "${currentSeg.title}"`,
      })
    } else {
      // Check for modifications
      const segmentChanges = compareSegments(templateSeg, currentSeg)
      if (segmentChanges.length > 0) {
        modifiedSegments.push(currentSeg)
        changes.push(...segmentChanges)
      }
    }
  }

  // Calculate drift percentage
  const totalSegments = Math.max(templateSegments.length, currentSegments.length)
  const matchingSegments = templateSegments.filter((templateSeg) => {
    const currentSeg = currentMap.get(templateSeg.key)
    if (!currentSeg) return false
    // Perfect match = no changes
    return compareSegments(templateSeg, currentSeg).length === 0
  }).length

  const driftPercentage = totalSegments > 0 ? Math.round((matchingSegments / totalSegments) * 100) : 100

  return {
    isDrifted: changes.length > 0,
    driftPercentage,
    hasTemplate: true,
    templateName,
    changes,
    addedSegments,
    removedSegments,
    modifiedSegments,
  }
}

/**
 * Compares two segments and returns a list of changes
 */
function compareSegments(
  templateSeg: SegmentDefinition,
  currentSeg: SegmentDefinition
): DriftChange[] {
  const changes: DriftChange[] = []

  if (templateSeg.title !== currentSeg.title) {
    changes.push({
      type: 'modified',
      segmentKey: currentSeg.key,
      field: 'title',
      oldValue: templateSeg.title,
      newValue: currentSeg.title,
      description: `Changed title: "${templateSeg.title}" → "${currentSeg.title}"`,
    })
  }

  if (templateSeg.description !== currentSeg.description) {
    changes.push({
      type: 'modified',
      segmentKey: currentSeg.key,
      field: 'description',
      oldValue: templateSeg.description,
      newValue: currentSeg.description,
      description: `Modified description for "${currentSeg.title}"`,
    })
  }

  if (templateSeg.durationMinutes !== currentSeg.durationMinutes) {
    changes.push({
      type: 'modified',
      segmentKey: currentSeg.key,
      field: 'durationMinutes',
      oldValue: templateSeg.durationMinutes,
      newValue: currentSeg.durationMinutes,
      description: `Changed "${currentSeg.title}" duration: ${templateSeg.durationMinutes} min → ${currentSeg.durationMinutes} min`,
    })
  }

  if (templateSeg.required !== currentSeg.required) {
    changes.push({
      type: 'modified',
      segmentKey: currentSeg.key,
      field: 'required',
      oldValue: templateSeg.required,
      newValue: currentSeg.required,
      description: `Changed "${currentSeg.title}" required: ${templateSeg.required} → ${currentSeg.required}`,
    })
  }

  if (templateSeg.allowsReordering !== currentSeg.allowsReordering) {
    changes.push({
      type: 'modified',
      segmentKey: currentSeg.key,
      field: 'allowsReordering',
      oldValue: templateSeg.allowsReordering,
      newValue: currentSeg.allowsReordering,
      description: `Changed "${currentSeg.title}" allows reordering: ${templateSeg.allowsReordering} → ${currentSeg.allowsReordering}`,
    })
  }

  return changes
}

/**
 * Helper to check if order of segments has changed
 */
export function hasSegmentOrderChanged(
  templateSegments: SegmentStructure,
  currentSegments: SegmentStructure
): boolean {
  if (templateSegments.length !== currentSegments.length) return true

  return templateSegments.some((templateSeg, index) => {
    return templateSeg.key !== currentSegments[index].key
  })
}
