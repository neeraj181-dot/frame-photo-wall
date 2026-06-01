/**
 * useVirtualGrid
 * Given the full frames array, current zoom, pan, and viewport size,
 * returns only the frames whose grid cells are currently visible
 * (plus an overscan buffer of 2 rows/cols on each side).
 *
 * This keeps the DOM to ~200-400 nodes even with 1000 frames.
 *
 * Parameters:
 *   frames      — full array of frame objects
 *   cols        — number of columns in the grid
 *   cellSize    — pixel size of one cell at zoom=1 (before zoom scaling)
 *   gap         — pixel gap between cells at zoom=1
 *   zoom        — current zoom level
 *   pan         — { x, y } pan offset in pixels
 *   vpW, vpH    — viewport width/height in pixels
 *
 * Returns:
 *   visibleFrames — array of { frame, row, col, top, left } for visible cells
 *   totalRows     — total number of rows
 *   canvasW       — total canvas width in pixels (at current zoom)
 *   canvasH       — total canvas height in pixels (at current zoom)
 */
import { useMemo } from 'react'

const OVERSCAN = 3   // extra rows/cols to render outside viewport

export default function useVirtualGrid({
  frames, cols, cellSize, gap, zoom, pan, vpW, vpH,
}) {
  return useMemo(() => {
    if (!frames.length || !vpW || !vpH) {
      return { visibleFrames: [], totalRows: 0, canvasW: 0, canvasH: 0 }
    }

    const totalRows = Math.ceil(frames.length / cols)
    const scaledCell = cellSize * zoom
    const scaledGap  = gap * zoom

    const canvasW = cols     * scaledCell + (cols     - 1) * scaledGap
    const canvasH = totalRows * scaledCell + (totalRows - 1) * scaledGap

    // Viewport bounds in canvas-space (accounting for pan)
    const viewLeft   = -pan.x
    const viewTop    = -pan.y
    const viewRight  = viewLeft + vpW
    const viewBottom = viewTop  + vpH

    // Which rows/cols are visible?
    const stride = scaledCell + scaledGap

    const firstCol = Math.max(0,         Math.floor(viewLeft   / stride) - OVERSCAN)
    const lastCol  = Math.min(cols - 1,  Math.ceil (viewRight  / stride) + OVERSCAN)
    const firstRow = Math.max(0,         Math.floor(viewTop    / stride) - OVERSCAN)
    const lastRow  = Math.min(totalRows - 1, Math.ceil(viewBottom / stride) + OVERSCAN)

    const visibleFrames = []
    for (let row = firstRow; row <= lastRow; row++) {
      for (let col = firstCol; col <= lastCol; col++) {
        const idx = row * cols + col
        if (idx >= frames.length) continue
        visibleFrames.push({
          frame: frames[idx],
          row,
          col,
          top:  row * stride,
          left: col * stride,
        })
      }
    }

    return { visibleFrames, totalRows, canvasW, canvasH }
  }, [frames, cols, cellSize, gap, zoom, pan, vpW, vpH])
}
