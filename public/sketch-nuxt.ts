import { defineNuxtPlugin } from '#app'

const createSketch = (fps, canvasWidth, canvasHeight, showVideoLinkFunc, durationElem = null, progressElem = null, timerElem = null) => {
  
    //TODO: add sketch here
}

export default defineNuxtPlugin(nuxt => {
  nuxt.app.createSketch = createSketch
})
