# eXist-db and Web Components - Part 1

by Joern Turner, 5. April 2018

This is the first of a series of articles dealing with Web Components and 
how they can be used within an eXist-db environment.

With the recent arrival of new eXist-db applications namely PackageManager, 
Launcher, UserManager and the new Dashboard it seems sensible to share the
 experiences of applying Web Components inside of eXist-db applications.
 
First article will be a very short introduction to what Web Components actually
 are and why they have been chosen for the aforementioned applications.
 
Part 2 will dive into the architecture of these applications and show how
 components can be applied to build modern and robust applications more quickly.
 
In Part 3 a broader look at the relationship between XML and Web Components is taken.
 A generative application which turns XML into Web Components and back will be introduced.
 
 
## What are Web Components?
 
Of course such articles have been written [elsewhere](https://www.webcomponents.org/introduction) but a short flyover
 nevertheless might be helpful to understand the impact of components.
 
## What are Web Components for?

But before diving into the details it might be worth noting which problem Web Components try to address:

When invented in the early 90s browsers were built for presenting and interconnecting documents. 
They were just that - simple document viewers. But more and more logic get packed into the pages. 
JavaScript made it possible to build even complex applications running in a browser. And this model
has been extremely successful leading to an avalanche of frameworks that try to fill in what the
browsers did not provide: a platform for building applications. Nowadays a myriad of cloud-based
applications built upon the browser as the ultimate frontend.
   
However browsers were never built with applications in mind. They do not offer things like
scoping or encapsulation. With applications growing more complex every day it’s a constant fight 
against these shortcomings, forcing developers to make sure that their listeners are not interfered by that 
new piece of code or that CSS rule is specific enough to not cause unwanted side-effects.

Frameworks have bridged the gap with more or less success over the years. However they come to a price:

* Usually they are not that easy to master than their homepages promise and require quite a bit of commitment

* The enormous speed of innovation in web technologies leads to an unlucky situation: once you’ve get used to one 
framework it’s declared dead or superseded by another framework splitting the developer world into Angular, React, Vue or Meteor evangelists

* Moving from one framework to another often requires a complete rewrite of the application


Web Components try to address these issues by allowing “component-based software engineering” (as Wikipedia states it) 
based upon web standards.

## What are Web Components made of?

Web Components build upon of 4 different specifications that are partly managed within the HTML5 standard itself 
and partly within the W3C:

* Custom Elements
* Shadow DOM
* HTML Imports
* HTML Templates

### Custom Elements

A custom element in HTML5 is just a normal element that contains a dash (‘-’) in its name. 
E.g. the dash in <my-element> makes it a custom element. So what’s the difference to just <myelement>?

The dash will tell the browser that the user is defining a new custom element which will be an extension of HTMLElement.
The simple <myelement> will be just an HTMLUnknownElement. The difference might not be obvious:

* a HTMLElement can be styled with CSS

* a HTMLElement can receive events

* a HTMLElement in the DOM behave as any other HTML element defined in HTML

* and of course Custom Elements can be handled with JavaScript as any other element

So in essence the Custom Element Spec makes a custom element a first class citizen inside of the browser 
and lets users invent their own tags.

### Shadow DOM

This one has probably the biggest impact on how apps are build as it allows true components inside of a browser.

Shortly speaking Shadow DOM allows to hook an arbitrary DocumentFragment to a custom-element. This means we can 
enhance the markup of a document by weaving in additional DOM. But it does more - it can even rearrange the DOM the 
user is seeing.

An example makes this much easier to understand. Imagine a page embedding a video. With Shadow DOM the video 
player (frame and controls) can be stored in a separate piece of markup that though not part of the browsers DOM 
is nevertheless rendered in the page. The result of mixing the browsers DOM and the Shadow DOM is sometimes 
called ‘composed DOM’.

But there’s much more about it:

* as the Shadow DOM is not part of the browers’ DOM global CSS will not apply to the Shadow DOM

* likewise events fired within the Shadow DOM will not escape the Shadow DOM boundaries

* JavaScript executed in the page scope will not interfere with Shadow DOM and elements inside it cannot be accessed from the outside

This effectively encapsulates a Web Component from its surrounding thus leading to largely enhanced robustness 
of applications as well as an increased potential for reuse of components. As such Web Components are similar to 
Objects in OOP languages: they define an interface to interact with by letting you interact with the elements 
attributes and public functions. But you can’t directly manipulate what’s inside. 

### HTML Imports

A HTML import works simply like an include for a Web Component. They are used just like a usual style import e.g.

```<link rel="import" href="my-element.html">```

but instead of loading a stylesheet this will load the component ‘my-element’. 

This is simple and elegant but still subject of discussions. Latest rumors imply that HTML Imports probably 
won’t make it in the long run. Currently ES6 loaders are discussed as an alternative. But in the end this one is not 
of such big importance for the developer.

### HTML Templates

Templates in HTML are pieces of markup that stay passive (inert) during page load. This means they are not 
parsed or otherwise handled by the browser but just sit there until instanciated (stamped) in the DOM. 
Templates are usually part of a Web Component (if it has some UI) and can be used to express the Shadow DOM 
of a component.
 
## Why Web Components?

What are the reasons to use Web Components and what are the advantages over frameworks?

The following list is probably not complete and biased by our current use:

* first of all there is longevity. Web Components are made of standards though parts are still in the works. 
There’s not just one vendor (though also not dozens). Standards have always been the essence of eXist-db which 
makes them a good fit.

* there are chances that Web Components become a native part of the browser platform meaning that you do 
not need to import a single library to run them.

* they are encouraging a clean, modular approach to developing applications which allows to reuse work you’ve done before.

* there are thousands of readymade components available from webcomponents.org which eases quick composition 
of complete applications.

* Web Components just feel ‘natural’ to the web platform. They provide a common API which is built right into HTML.


## How are they supported?

This is always the crucial question. The current status of browser implementations can be looked up at 
webcomponents.org. However that’s only part of the story. There were decent standards that nevertheless 
never made it into the browsers due to lack of support from the vendors.

This time it seems different. The biggest player on the field is certainly Google - in Chrome Web Components are 
already fully supported natively and Google is engaged in the scene most notably through Polymer which is the most 
prominent Web Components library. Furthermore - have you looked under the hood of Youtube recently? If you do you’ll 
find that Google reimplemented the whole UI using Web Components. It’s certainly a statement when Google uses the 
technology in their flagship.

But of course there are still differences between the vendors. While some are quite far already others stay back a 
little. That’s why something like Polymer was created to polyfill (fill in the missing gaps) the missing parts 
and provide cross-browser compatibility. This way Web Components can be fully used in all major browsers - mobile or desktop.

This was it for today. Next part will discuss how Web Components are used within eXist-db and shed some light on the 
challenges and accomplishments. It will also go beyond the UI part and show how Web Components techniques can be used 
to build modular applications.



