"use client";

import { Canvas, useFrame } from '@react-three/fiber'
import { Instances, Instance, OrbitControls, Environment, Lightformer } from '@react-three/drei'
import { useState, useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'

const VOXEL_SIZE = 1
const COUNT = 800

function Voxel({ position, targetPosition, color, section }) {
  const ref = useRef()
  const offset = useMemo(() => Math.random() * 100, [])

  // Store current color and target color refs to lerp
  const currentColor = useRef(new THREE.Color(color))
  const targetColorInfo = useMemo(() => {
    // Define theme colors for stages
    return [
      new THREE.Color('#444444'), // Stage 0: Chaos (Dark/Raw)
      new THREE.Color('#a9ddd3'), // Stage 1: Network (Brand Teal)
      new THREE.Color('#E8E3D5'), // Stage 2: Apps (Brand Bone)
      new THREE.Color('#ffffff'), // Stage 3: Economy (Pure White)
    ]
  }, [])

  useFrame((state, delta) => {
    if (!ref.current) return

    const t = state.clock.getElapsedTime()
    const speed = 3 * delta // slightly faster global speed for responsiveness

    // Position Lerp
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, targetPosition[0], speed)
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, targetPosition[1], speed)
    ref.current.position.z = THREE.MathUtils.lerp(ref.current.position.z, targetPosition[2], speed)

    // Rotation Lerp (align to grid in later stages)
    const targetRotation = section === 0 ? Math.sin(t + offset) : 0
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, targetRotation, speed)
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, targetRotation, speed)

    // Color Lerp
    // Mix the original instance color with the stage theme color
    const theme = targetColorInfo[section] || targetColorInfo[0]
    currentColor.current.lerp(theme, delta * 2)
    ref.current.color.copy(currentColor.current)
  })

  return <Instance ref={ref} />
}

function VoxelField({ section }) {
  const { data } = useMemo(() => {
    const temp = []
    const range = 25
    const side = Math.ceil(Math.pow(COUNT, 1 / 3))

    for (let i = 0; i < COUNT; i++) {
      const pos0 = [
        (Math.random() - 0.5) * range,
        (Math.random() - 0.5) * range,
        (Math.random() - 0.5) * range
      ]

      const gridSize = Math.floor(Math.sqrt(COUNT))
      const row = Math.floor(i / gridSize)
      const col = i % gridSize
      const pos1 = [
        (col - gridSize / 2) * 1.5,
        -5,
        (row - gridSize / 2) * 1.5
      ]

      const group = i % 3
      const towerHeight = Math.floor(i / 9)
      const towerX = (i % 3) - 1
      const towerZ = (Math.floor(i / 3) % 3) - 1

      let offsetX = 0
      if (group === 0) offsetX = -10
      if (group === 1) offsetX = 0
      if (group === 2) offsetX = 10

      const pos2 = [
        towerX * 1.2 + offsetX,
        towerHeight * 1.2 - 5,
        towerZ * 1.2
      ]

      const phi = Math.acos(-1 + (2 * i) / COUNT)
      const theta = Math.sqrt(COUNT * Math.PI) * phi
      const r = 8
      const pos3 = [
        r * Math.cos(theta) * Math.sin(phi),
        r * Math.sin(theta) * Math.sin(phi),
        r * Math.cos(phi)
      ]

      temp.push({ 0: pos0, 1: pos1, 2: pos2, 3: pos3 })
    }
    return { data: temp }
  }, [])

  return (
    <Instances range={COUNT}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.2} metalness={0.8} />
      {data.map((d, i) => (
        <Voxel
          key={i}
          position={d[0]} // Start at chaos
          targetPosition={d[section]}
          color="#ffffff" // Initial color, will be overriden by lerp
          section={section}
        />
      ))}
    </Instances>
  )
}

function Scene({ section }) {
  return (
    <>
      <VoxelField section={section} />
      <Environment preset="city" />
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#E8E3D5" />
      <pointLight position={[-10, 0, -10]} intensity={1} color="#a9ddd3" />
    </>
  )
}

const tutorialSteps = [
  {
    title: "Stage 1: The Raw Real World",
    subtitle: "Fragmented, Chaotic, Disconnected",
    description: "In the traditional world, assets and data are siloed. Information floats in disconnected voids—bank ledgers, real estate deeds, weather stations. There is no unified truth, only disparate signals.",
  },
  {
    title: "Stage 2: The Rialo Network",
    subtitle: "Ordering the Chaos",
    description: "Rialo acts as the unification layer. It ingests real-world signals and orders them into a coherent, verifiable grid. This isn't just a ledger; it's a structural framework that understands physics, time, and identity natively.",
  },
  {
    title: "Stage 3: Application Assembly",
    subtitle: "Building Meaningful Structures",
    description: "Once data is ordered on the Rialo grid, developers can snap these 'blocks' together to build powerful Applications. A weather block + a payment block = automated insurance. No bridges, no wrappers, just building.",
  },
  {
    title: "Stage 4: Connected Value",
    subtitle: "A Solid State Economy",
    description: "The result is a solid, interconnected economy where Real World Assets (RWAs) behave like native digital objects. Instant settlement, global liquidity, and absolute privacy. This is the solid state of the future.",
  }
]

function Interface({ section, setSection }) {
  const currentStep = tutorialSteps[section] || tutorialSteps[0]

  return (
    <main style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '3rem',
      color: '#E8E3D5'
    }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pointerEvents: 'auto' // Header is clickable
      }}>
        <div style={{ width: '60px' }}>
          <svg width="100%" height="100%" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="178" height="178" rx="29" fill="#141414" stroke="#E8E3D5" strokeWidth="2" />
            <path d="M106.625 100.655C103.736 100.493 100.89 99.3801 98.9586 97.1916C96.2725 94.2692 95.3217 89.5202 96.9506 85.8339C98.9818 81.0683 103.912 79.0425 108.895 79.3912C112.608 79.3912 121.036 79.3912 125.354 79.3912C126.767 79.3713 128.004 79.4576 129.264 79.2982C132.166 78.9927 135.208 77.0831 136.76 74.5392C139.712 70.0692 138.595 63.5335 134.127 60.4782C132.349 59.1831 130.211 58.5953 128.02 58.4292C126.927 58.3196 125.826 58.1967 124.789 57.8812C121.508 56.9016 118.901 54.371 117.821 51.143C117.229 49.4626 117.253 47.6394 116.95 45.8992C116.252 41.7081 113.011 38.4934 108.799 37.5403C107.838 37.3145 106.927 37.1484 106.036 37.1418C95.827 37.1086 77.8698 37.0122 74.0268 37.0023C68.9239 36.896 64.0503 40.5092 63.1561 45.6169C62.1156 50.5685 65.1108 55.8621 69.8414 57.5259C71.5136 58.1502 72.8766 58.2864 74.6983 58.2665C80.2766 58.3196 81.4358 58.4525 84.4909 58.4823C88.4203 58.3561 92.6921 60.269 94.5903 63.776C98.7358 71.4308 92.8384 79.5838 84.3912 79.2849C73.9426 79.3082 67.9166 79.2716 55.3771 79.2816C53.2195 79.2982 51.5573 79.1587 49.5129 79.7067C43.632 81.0882 40.0583 87.8763 42.2491 93.5286C43.5655 97.2547 47.0528 99.9447 50.9889 100.426C55.9023 100.745 66.7055 100.463 79.1121 100.552C81.9677 100.552 84.0587 100.552 84.8898 100.552C85.691 100.546 86.4423 100.639 87.3066 100.811C92.5791 101.698 96.1794 106.832 95.8769 112.036C95.8769 115.547 95.8769 126.297 95.8769 131.653C95.8669 133.583 96.2126 135.569 97.2099 137.445C100.066 143.008 107.765 144.781 112.788 140.975C116.584 138.189 117.406 134.134 117.189 129.74C117.183 125.274 117.196 117.649 117.189 112.704C117.618 106.138 113.406 100.928 106.694 100.669L106.628 100.662L106.625 100.655Z" fill="#BBEBE1" />
          </svg>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a href="https://rialo.network" target="_blank" style={{ fontSize: '0.875rem', color: '#E8E3D5', textDecoration: 'none', opacity: 0.8, fontWeight: 'bold' }}>
            Main Site
          </a>
          <div style={{ fontSize: '0.875rem', opacity: 0.5, color: '#E8E3D5' }}>Interactive Demo</div>
        </div>
      </header>

      <section style={{ maxWidth: '36rem', pointerEvents: 'auto' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={section}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <h2 style={{ color: '#a9ddd3', fontSize: '0.875rem', fontFamily: 'monospace', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {currentStep.subtitle}
            </h2>
            <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1.5rem', lineHeight: 1.1, color: '#E8E3D5' }}>
              {currentStep.title}
            </h1>
            <p style={{
              fontSize: '1.125rem',
              color: '#E8E3D5',
              lineHeight: 1.625,
              marginBottom: '2rem',
              borderLeft: '2px solid #a9ddd3',
              paddingLeft: '1.5rem',
              opacity: 0.9
            }}>
              {currentStep.description}
            </p>
          </motion.div>
        </AnimatePresence>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setSection(prev => Math.max(0, prev - 1))}
            disabled={section === 0}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid #E8E3D5',
              borderRadius: '0.25rem',
              background: 'transparent',
              color: '#E8E3D5',
              cursor: section === 0 ? 'not-allowed' : 'pointer',
              opacity: section === 0 ? 0.3 : 1
            }}
          >
            Previous Step
          </button>
          <button
            onClick={() => setSection(prev => Math.min(tutorialSteps.length - 1, prev + 1))}
            disabled={section === tutorialSteps.length - 1}
            style={{
              padding: '0.75rem 2rem',
              background: '#a9ddd3',
              borderRadius: '0.25rem',
              border: 'none',
              color: '#010101',
              fontWeight: 'bold',
              cursor: section === tutorialSteps.length - 1 ? 'not-allowed' : 'pointer',
              opacity: section === tutorialSteps.length - 1 ? 0.3 : 1
            }}
          >
            {section === tutorialSteps.length - 1 ? 'Completed' : 'Next Stage'}
          </button>
        </div>
      </section>

      <footer style={{ display: 'flex', gap: '0.5rem', opacity: 0.5 }}>
        {tutorialSteps.map((_, i) => (
          <div
            key={i}
            style={{
              height: '0.25rem',
              flex: 1,
              borderRadius: '9999px',
              transition: 'background-color 0.5s',
              backgroundColor: i <= section ? '#a9ddd3' : '#333333'
            }}
          />
        ))}
      </footer>

      <div style={{
        position: 'absolute',
        bottom: '3rem',
        right: '3rem',
        pointerEvents: 'auto',
        fontSize: '0.875rem',
        opacity: 0.6
      }}>
        <a href="https://x.com/0xshawtyy" target="_blank" style={{ color: '#E8E3D5', textDecoration: 'none' }}>
          Built by 0xshawtyy
        </a>
      </div>

    </main>
  )
}

export default function Page() {
  const [section, setSection] = useState(0)

  // Tailwind isn't installed so this inline style is backup
  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#050505' }}>
      <Canvas camera={{ position: [15, 10, 15], fov: 35 }}>
        <color attach="background" args={["#050505"]} />
        <fog attach="fog" args={["#050505", 20, 100]} />
        <Scene section={section} />
        <OrbitControls enableZoom={true} minDistance={5} maxDistance={50} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
      <Interface section={section} setSection={setSection} />
    </div>
  )
}
