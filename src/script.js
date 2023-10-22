import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import GUI from "lil-gui"

THREE.ColorManagement.enabled = false

// Debug
const gui = new GUI({ width: 400 })

// Canvas
const canvas = document.querySelector("canvas.webgl")

// Scene
const scene = new THREE.Scene()

/* -----------------------------Galaxy-------------------------------- */

const parameters = {
  count: 100000,
  size: 0.01,
  radius: 5,
  branches: 3,
  spin: 3,
  randomness: 0.2,
  randomnessPower: 3,
  insideColor: "#ff6030",
  outsideColor: "#1b3984",
}

let particlesGeometry, particlesMaterial, particles

const generateGalaxy = () => {
  // remove previous particles(galaxy) is they exist so that when we change in gui we generate new one
  if (particles) {
    particlesGeometry.dispose() // always dispose of not used geometry
    particlesMaterial.dispose() // always dispose of not used material
    scene.remove(particles) // always remove stuff from scene that are not used
  }

  /* Geometry */
  particlesGeometry = new THREE.BufferGeometry()

  const positionsArray = new Float32Array(parameters.count * 3)
  const colorsArray = new Float32Array(parameters.count * 3)

  const insideColor = new THREE.Color(parameters.insideColor)
  const outsideColor = new THREE.Color(parameters.outsideColor)

  for (let i = 0; i < parameters.count; i++) {
    const radius = Math.random() * parameters.radius

    // bigger the spingAngle, bigger the spin of the galaxy
    const spinAngle = radius * parameters.spin

    /* The formula takes the remainder of "i" module by branches, which ensures that the value of branchAngle will 
    always be between 0 and branches value. This value is then divided by branches to normalize it to a value between 0 and 1. 
    Finally, the result is multiplied by Math.PI * 2 to convert it to radians. */
    const branchAngle =
      ((i % parameters.branches) / parameters.branches) * Math.PI * 2

    const randomX =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1)
    const randomY =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1)
    const randomZ =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1)

    /* position */

    // seperate x,y,z
    positionsArray[i * 3 + 0] =
      Math.cos(branchAngle + spinAngle) * radius + randomX
    positionsArray[i * 3 + 1] = randomY
    positionsArray[i * 3 + 2] =
      Math.sin(branchAngle + spinAngle) * radius + randomZ

    const mixedColor = insideColor.clone()
    mixedColor.lerp(outsideColor, radius / parameters.radius)

    colorsArray[i * 3 + 0] = mixedColor.r
    colorsArray[i * 3 + 1] = mixedColor.g
    colorsArray[i * 3 + 2] = mixedColor.b
  }

  particlesGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positionsArray, 3)
  )

  particlesGeometry.setAttribute(
    "color",
    new THREE.BufferAttribute(colorsArray, 3)
  )

  /* Material */
  particlesMaterial = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  })

  /* Points */
  particles = new THREE.Points(particlesGeometry, particlesMaterial)

  scene.add(particles)
}

generateGalaxy()

/* ------------------------------Tweaks -------------------------------*/

/* when we change count and size parameters we need to generate galaxy again.
We listen to "onFinishChange", instead of "onChange" because we dont want to generate galaxy while moving the slider. */

gui
  .add(parameters, "count")
  .min(100)
  .max(100000)
  .step(100)
  .onFinishChange(generateGalaxy)
gui
  .add(parameters, "size")
  .min(0.0)
  .max(0.1)
  .step(0.001)
  .onFinishChange(generateGalaxy)
gui
  .add(parameters, "radius")
  .min(0.01)
  .max(20)
  .step(0.01)
  .onFinishChange(generateGalaxy)
gui
  .add(parameters, "branches")
  .min(2)
  .max(20)
  .step(1)
  .onFinishChange(generateGalaxy)
gui
  .add(parameters, "spin")
  .min(-5)
  .max(5)
  .step(1)
  .onFinishChange(generateGalaxy)
gui
  .add(parameters, "randomness")
  .min(0)
  .max(2)
  .step(0.001)
  .onFinishChange(generateGalaxy)
gui
  .add(parameters, "randomnessPower")
  .min(1)
  .max(10)
  .step(0.001)
  .onFinishChange(generateGalaxy)
gui.addColor(parameters, "insideColor").onFinishChange(generateGalaxy)
gui.addColor(parameters, "outsideColor").onFinishChange(generateGalaxy)

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
})
renderer.outputColorSpace = THREE.LinearSRGBColorSpace
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
