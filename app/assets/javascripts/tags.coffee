# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://coffeescript.org/
window.onload = ->
  try
    options = 
      depth: 0.5
      textFont: 'Impact,"Arial Black",sans-serif'
      textColour: null
      maxSpeed: 0.05
      outlineMethod: 'colour'
      outlineColour: 'green'
      shuffleTags: true
    TagCanvas.Start 'myCanvas', '', options
  catch e
    # something went wrong, hide the canvas container
    alert e
    document.getElementById('myCanvasContainer').style.display = 'none'
  return