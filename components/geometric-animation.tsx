"use client"

import { useEffect, useRef } from "react"

interface GeometricAnimationProps {
  color?: string
  speed?: number
  className?: string
}

export function GeometricAnimation({ color = "#06b6d4", speed = 1, className = "" }: GeometricAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // 设置画布尺寸
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // 几何图形类
    class GeometricShape {
      x: number
      y: number
      size: number
      rotation: number
      rotationSpeed: number
      opacity: number
      type: "triangle" | "square" | "circle" | "hexagon"
      color: string

      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 30 + 10
        this.rotation = Math.random() * Math.PI * 2
        this.rotationSpeed = (Math.random() - 0.5) * 0.02 * speed
        this.opacity = Math.random() * 0.3 + 0.1
        this.type = ["triangle", "square", "circle", "hexagon"][Math.floor(Math.random() * 4)] as any
        this.color = color
      }

      update() {
        this.rotation += this.rotationSpeed

        // 缓慢移动
        this.x += Math.sin(this.rotation) * 0.5
        this.y += Math.cos(this.rotation) * 0.3

        // 边界检查
        if (this.x < -this.size) this.x = canvas.width + this.size
        if (this.x > canvas.width + this.size) this.x = -this.size
        if (this.y < -this.size) this.y = canvas.height + this.size
        if (this.y > canvas.height + this.size) this.y = -this.size
      }

      draw() {
        if (!ctx) return

        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate(this.rotation)
        ctx.globalAlpha = this.opacity
        ctx.strokeStyle = this.color
        ctx.lineWidth = 1
        ctx.fillStyle = this.color + "20"

        switch (this.type) {
          case "triangle":
            this.drawTriangle()
            break
          case "square":
            this.drawSquare()
            break
          case "circle":
            this.drawCircle()
            break
          case "hexagon":
            this.drawHexagon()
            break
        }

        ctx.restore()
      }

      drawTriangle() {
        if (!ctx) return
        const size = this.size / 2
        ctx.beginPath()
        ctx.moveTo(0, -size)
        ctx.lineTo(-size * 0.866, size * 0.5)
        ctx.lineTo(size * 0.866, size * 0.5)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
      }

      drawSquare() {
        if (!ctx) return
        const size = this.size / 2
        ctx.beginPath()
        ctx.rect(-size, -size, size * 2, size * 2)
        ctx.fill()
        ctx.stroke()
      }

      drawCircle() {
        if (!ctx) return
        ctx.beginPath()
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      }

      drawHexagon() {
        if (!ctx) return
        const size = this.size / 2
        ctx.beginPath()
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3
          const x = Math.cos(angle) * size
          const y = Math.sin(angle) * size
          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
      }
    }

    // 创建几何图形
    const shapes: GeometricShape[] = []
    const shapeCount = Math.floor((canvas.width * canvas.height) / 50000)

    for (let i = 0; i < shapeCount; i++) {
      shapes.push(new GeometricShape())
    }

    // 动画循环
    function animate() {
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      shapes.forEach((shape) => {
        shape.update()
        shape.draw()
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [color, speed])

  return (
    <canvas ref={canvasRef} className={`absolute inset-0 pointer-events-none ${className}`} style={{ zIndex: -1 }} />
  )
}
