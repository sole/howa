# Hands On Web Audio

> A slide deck which is also an in-context demo

I made this because most of the talks on multimedia-y things have to leave the slides to go to a demo, and I feel that breaks the flow for the audience. So now the demos in this talk are all integrated with the talk, and you never leave the slides.

[Watch online](http://soledadpenades.com/files/t/2015_howa/) or read on for how to get the code and build the slides.

Headphones or a properly spatialised audio system highly recommended.

## Credits

* Amazing THX intro sound by [Stuart Memo](http://stuartmemo.com/), but heavily edited because I didn't want to introduce yet another dependency
* Bird chirps sliced from 'House sparrow' http://www.xeno-canto.org/255974 by Cedric Mroczko
* Font files from TTF to JS via http://gero3.github.io/facetype.js/
* 437 http://www.dafont.com/perfect-dos-vga-437.font

## To run

```bash
git clone https://github.com/sole/howa.git
cd howa
npm install
npm start
```

(i.e. you need node.js installed to run npm)

The slides will be built into `build/`. Open `build/index.html` with your browser of choice and enjoy! (It will take a while to load as there's a lot of 3D content to generate)

## Keys

* Left/Right arrows to move between slides
* F to toggle full screen
* 3 to toggle between anaglyph ('3D') or normal rendering
* Move the mouse up/down or left/right in some scenes to get interesting audio effects

## Walkthrough

This is very synthetic, just in case you want some pointers. I will provide more info soon in the shape of an article or similar. You should <a href="http://soledadpenades.com/">subscribe to my blog</a> to stay updated! ;-)

* slide content is determined by `index.jade`
* one section = one slide
* no nesting
* Each slide is an instance of Slide3D which is Renderable
	* there's the .render() method
* on load the content of each section is parsed and some nodes are converted into three dimensional text and other nodes are replaced by three.js scenes
* scenes code must be placed in `client/js/scenes/`
* scenes.render method
* inheriting from Renderable
	* Renderable things are able to traverse their children and call `render` on them, if the method exists (you don't need to inherit from renderable if you just want to render)
	* you want to render when you want dynamic content in an object. otherwise an static representation should be fine.
* img replacement attribute = data-replace='scene key' in the array of replacements in htmlTo3D.js (`replacementScenes`)

