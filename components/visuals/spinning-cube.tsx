'use client'

import { useEffect, useRef } from 'react'

type Vec3 = { x: number; y: number; z: number }
type Vec2 = { x: number; y: number }

export default function SpinningCube() {
  const preRef = useRef<HTMLPreElement>(null)

  useEffect(() => {
    let rx = 0
    let ry = 0
    let rz = 0
    let animationId: number

    const NB_COLS = 100
    const NB_ROWS = 40
    const symbols = '$$**++--@@=='

    const cubeVertices: Vec3[] = [
      { x: -1, y: -1, z: -1 },
      { x: -1, y: 1, z: -1 },
      { x: 1, y: 1, z: -1 },
      { x: 1, y: -1, z: -1 },
      { x: 1, y: 1, z: 1 },
      { x: 1, y: -1, z: 1 },
      { x: -1, y: -1, z: 1 },
      { x: -1, y: 1, z: 1 },
    ]

    const cubeTriangles: number[][] = [
      [0, 1, 2], [0, 2, 3],
      [3, 2, 4], [3, 4, 5],
      [5, 4, 7], [5, 7, 6],
      [6, 7, 1], [6, 1, 0],
      [6, 0, 3], [6, 3, 5],
      [1, 7, 4], [1, 4, 2],
    ]

    const cameraV: Vec3 = { x: 0, y: 0, z: 1 }

    const rotateAroundX = (v: Vec3, angle: number): Vec3 => ({
      x: v.x,
      y: Math.cos(angle) * v.y - Math.sin(angle) * v.z,
      z: Math.sin(angle) * v.y + Math.cos(angle) * v.z,
    })

    const rotateAroundY = (v: Vec3, angle: number): Vec3 => ({
      x: Math.cos(angle) * v.x + Math.sin(angle) * v.z,
      y: v.y,
      z: -Math.sin(angle) * v.x + Math.cos(angle) * v.z,
    })

    const rotateAroundZ = (v: Vec3, angle: number): Vec3 => ({
      x: Math.cos(angle) * v.x - Math.sin(angle) * v.y,
      y: Math.sin(angle) * v.x + Math.cos(angle) * v.y,
      z: v.z,
    })

    const project = (v: Vec3): Vec2 => ({
      x: Math.round(v.x / v.z + NB_COLS / 2),
      y: Math.round(v.y / v.z + NB_ROWS / 2),
    })

    const dotProduct = (a: Vec3, b: Vec3) => a.x * b.x + a.y * b.y + a.z * b.z
    const crossProduct = (a: Vec3, b: Vec3): Vec3 => ({
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x,
    })

    const drawScanLine = (screen: string[][], y: number, x0: number, x1: number, symbol: string) => {
      if (y < 0 || y >= NB_ROWS) return
      const left = Math.max(0, Math.min(x0, x1))
      const right = Math.min(NB_COLS - 1, Math.max(x0, x1))
      for (let x = left; x <= right; x++) screen[y][x] = symbol
    }

    const drawFlatBottom = (screen: string[][], t: Vec2, b0: Vec2, b1: Vec2, symbol: string) => {
      let xB = t.x
      let xE = t.x
      const xDec0 = (t.x - b0.x) / (b0.y - t.y)
      const xDec1 = (t.x - b1.x) / (b1.y - t.y)
      const yB = Math.floor(t.y)
      const yE = Math.floor(b0.y + 1)
      for (let y = yB; y < yE; y++) {
        drawScanLine(screen, y, Math.round(xB), Math.round(xE), symbol)
        xB -= xDec0
        xE -= xDec1
      }
    }

    const drawFlatTop = (screen: string[][], t0: Vec2, t1: Vec2, b: Vec2, symbol: string) => {
      let xB = t0.x
      let xE = t1.x
      const xInc0 = (b.x - t0.x) / (b.y - t0.y)
      const xInc1 = (b.x - t1.x) / (b.y - t1.y)
      const yB = Math.floor(t0.y)
      const yE = Math.floor(b.y + 1)
      for (let y = yB; y < yE; y++) {
        drawScanLine(screen, y, Math.round(xB), Math.round(xE), symbol)
        xB += xInc0
        xE += xInc1
      }
    }

    const drawTriangle = (screen: string[][], v0: Vec2, v1: Vec2, v2: Vec2, symbol: string) => {
      let vertices = [v0, v1, v2]
      vertices.sort((a, b) => a.y - b.y)
      ;[v0, v1, v2] = vertices

      if (v2.y === v1.y) return drawFlatBottom(screen, v0, v1, v2, symbol)
      if (v0.y === v1.y) return drawFlatTop(screen, v0, v1, v2, symbol)

      const midpoint: Vec2 = { x: v0.x + (v2.x - v0.x) * ((v1.y - v0.y) / (v2.y - v0.y)), y: v1.y }
      drawFlatBottom(screen, v0, v1, midpoint, symbol)
      drawFlatTop(screen, v1, midpoint, v2, symbol)
    }

    function render() {
      const screen: string[][] = Array(NB_ROWS)
        .fill(null)
        .map(() => Array(NB_COLS).fill(' '))

      for (let s = 0; s < cubeTriangles.length; s++) {
        const triangle = cubeTriangles[s]
        const transformed: Vec3[] = []

        for (let i = 0; i < 3; i++) {
          let v = { ...cubeVertices[triangle[i]] }
          v = rotateAroundX(v, rx)
          v = rotateAroundY(v, ry)
          v = rotateAroundZ(v, rz)
          v.z += 8
          const scale = 45
          v.y *= scale
          v.x *= scale * 2
          transformed.push(v)
        }

        const v01: Vec3 = {
          x: transformed[1].x - transformed[0].x,
          y: transformed[1].y - transformed[0].y,
          z: transformed[1].z - transformed[0].z,
        }
        const v02: Vec3 = {
          x: transformed[2].x - transformed[0].x,
          y: transformed[2].y - transformed[0].y,
          z: transformed[2].z - transformed[0].z,
        }
        const normal = crossProduct(v01, v02)
        if (dotProduct(cameraV, normal) >= 0) continue

        const projected = transformed.map(project)
        drawTriangle(screen, projected[0], projected[1], projected[2], symbols[s])
      }

      let result = ''
      for (let i = 0; i < NB_ROWS; i++) result += screen[i].join('') + '\n'
      if (preRef.current) preRef.current.textContent = result

      const delta = 0.016
      rx = (rx + 0.8 * delta) % (2 * Math.PI)
      ry = (ry + 0.8 * delta) % (2 * Math.PI)
      rz = (rz + 0.8 * delta) % (2 * Math.PI)
      animationId = requestAnimationFrame(render)
    }

    render()
    return () => {
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <pre
      ref={preRef}
      className="font-mono text-xs leading-[1.2] text-zinc-400 sm:text-sm lg:text-base"
      style={{ letterSpacing: '0.05em' }}
    />
  )
}
