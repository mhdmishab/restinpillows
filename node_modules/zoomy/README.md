# Zoomy
Lightweight VanillaJS plugin for zooming images on hover. Super simple to use, easy to customise and only 1kb minified.

[Demo](https://codepen.io/tomgreener/pen/PKBbPj)

### Installation
Save `zoomy.min.js` locally and reference it in your HTML file, ideally at the end of the body.

### Usage
The only requirement when using zoomy is that you wrap zoomable images in a parent container with the class `zoomy`, or a custom class if you have specified one during initation (see options below). The parent container should have `overflow: hidden`, and the image should have `width:100%; height:auto`. Using the HTML5 `<figure>` element as a parent container is a good semantic choice.

Then you just need to initiate the plugin by calling `initZoomy();`, passing the function either an empty object (`{}`) or an object containing custom options. Ideally, Zoomy should be initiated once the DOM is loaded. An example setup is as follows:

```html
<head>
  <style>
    .zoomy {
        width: 420px;
        overflow: hidden;
    }

    .zoomy img {
        width: 100%;
        height: auto;
        backface-visibility: hidden;
    }
  </style>
</head>
<body>
  <figure class="zoomy">
    <img src="https://images.pexels.com/photos/93689/pexels-photo-93689.jpeg">
  </figure>
  <script src="zoomy.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', function () { 
        initZoomy({});
    });
  </script>
</body>
```

### Options

Zoomy has several custom options you can specify via an object when you call `initZoomy();`.



**zoomFactor**

The scale factor of the zoomed image (default: 2).

**class**

The parent container class that Zoomy will look for (default: 'zoomy').

**direction**

The axis on which the user can pan the zoomed image (default: 'both' - can also be 'horizontal' or 'vertical').

**cursor**

Whether the user sees a `'crosshair'` cursor when panning the zoomed image (default: false).


An example of a more customised setup:

```html
<head>
  <style>
    .product-image-zoomable {
        width: 420px;
        overflow: hidden;
    }

    .product-image-zoomable img {
        width: 100%;
        height: auto;
        backface-visibility: hidden;
    }
  </style>
</head>
<body>
  <figure class="product-image-zoomable">
    <img src="https://images.pexels.com/photos/93689/pexels-photo-93689.jpeg">
  </figure>
  <script src="zoomy.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', function () {
        const options = {
          zoomFactor: 3,
          class: 'product-image-zoomable',
          direction: 'horizontal',
          cursor: true
        };
        initZoomy(options);
    });
  </script>
</body>
```
