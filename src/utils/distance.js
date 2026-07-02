function calculateDistance(pointA, pointB) {
  return Math.hypot(pointB.x - pointA.x, pointB.y - pointA.y)
}

function nearestNeighbor(start, points) {
  const route = []
  const remaining = [...points]
  let current = start

  while (remaining.length > 0) {
    let minDistance = Infinity
    let minIndex = 0
    remaining.forEach((point, index) => {
      const distance = calculateDistance(current, point)
      if (distance < minDistance) {
        minDistance = distance
        minIndex = index
      }
    })
    route.push(remaining[minIndex])
    current = remaining[minIndex]
    remaining.splice(minIndex, 1)
  }
  return route
}

function calculateOptimalRoute(base, fullBins) {
  return fullBins.length === 0 ? [] : nearestNeighbor(base, fullBins)
}

export { calculateDistance, nearestNeighbor, calculateOptimalRoute }
