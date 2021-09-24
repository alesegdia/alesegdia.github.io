---
layout: post
title:  "Demux Devlog 2 - Building the map"
date:   2016-1-28 13:44:37 +0100
categories: gamedev gdxjam
excerpt_separator: <!--more-->
---

In the last Demux devlog post I sketched the idea of what kind of game Demux wants to be. In this post I will talk about map representation and generation, which is probably the most important part to the project and the one I do want to highlight. The game is understood as a metroidvania with generated maps, so we first need to formalize the key parts of a Metroid or Castlevania maps.

<!--more-->

<script type="text/javascript" src="http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML"></script>

# Heads up! let's do this!

So we want to build a generator for metroidvania-like games. Maps in this kind of games are conceptually made up of units of blocks of tiles forming rectangles and other irregular forms. An important spec to define is the size in tiles a room block will have. This is, if a block have a size of 32x32 tiles, a room of 2x1 will have 64x32 tiles. By now we can abstract ourselves and forget about it.

![Super Metroid map]({{ site.baseurl }}/assets/m3map2.gif){: .pure-img .center-image}

Here you have a Super Metroid map layout, built from blocks of tiles forming rooms. The only room geometry we will use is a subset of what resides in metroidvania-like games: **rectangles**. This will help the room placement and collision check a lot. Each block of each room can have links to other rooms, so that we can travel through rooms. These links can be **left**, **right**, **top** and **bottom** inside the block of tiles. Links will be placed on the same place inside the tile block depending only on the facing.

Also, we must emphasize the aspect in this kind if games of needing abilities in order to advance through areas. A classical example is the double jump, so that the designer place areas that are only reachable if we have the double jump powerup. Obviously a designer does this by hand, but we will try to sketch some generation for this. First of all, I will focus on layout generation though, but I will talk about this aspect later in this post.

So, to sum up, the two core ideas behind these games that we must care about are:

* Map layout made up of block tiles.

* Sense of progress integrated with the map, so that you have to collect powerups in order to advance.

For the map generation, a separated project has been created, baptized as [troidgen](https://github.com/alesegdia/troidgen).

# Layout generation

To make a basic layout, I've taken ideas from [TinyKeep's creator](http://www.gamasutra.com/blogs/AAdonaac/20150903/252889/Procedural_Dungeon_Generation_Algorithm.php) but using a much more simpler approach instead of using a physics library. For that, I built an OverlapSolver that takes as input a collection of rectangles and displace them in order to avoid overlapping.

Here is an example of what was achieved:

![Testing overlap solver]({{ site.baseurl }}/assets/mapsamples.png){: .pure-img .center-image}

Simple but nice. The algorithm basically computes a repulsion vector for each rectangle depending on if it is colliding with other rectangles or not. There are also some parameters to tweak here, like an enclosing rectangle for the map, so that rooms keep themselves inside that enclosing rectangle, or a parameter for tweaking the repulsion force. Just to repeat myself, now there are random rooms, but later rooms will need to have a specific and well defined size.

# Connections between rooms

Placing connections by hand leads to a smaller number of possibilities, all the rooms would need to be connected, and also more work would be needed in tiled. But if instead of placing doors we assume that every block of tiles in a room can have an external door (if possible), the problem could be simplified a little when looking for possible maps given a set of rooms.

![Connections in rooms]({{ site.baseurl }}/assets/sampledoors.png){: .pure-img .center-image}

Here an example of a 2x2 blocks room with a resolution for blocks of 8x8 tiles to illustrate what I mean. Red marks are places where doors can be positioned. Possible links are always placed in the same place. The possible link places, supposing a resolution of `(bw, bh)` for blocks, will be as follows:

| Block side    | Block coordinates |
|---------|-------------------|
| Left    | `(0, 0)`           |
| Right   | `(bw, 0)` |
| Top     | `(bw/2, bh)` |
| Bottom  | `(bw/2, 0)` |
|---------|-------------------|

This restriction has to be kept in mind while making the maps so that no possible connection is blocked and is accessible from other possible connections. This can be thought as a high restriction when making maps, but it simplifies the generation a lot. Also note that if we use a high block resolution, this issue becomes quite minor.

# Polishing the layout

So ok, we have a map, but we want to get rid of unconnected rooms, and of course to make it bigger! Here you have a little recipe:

1. Place rooms randomly and solve overlapping.
2. Extract connected room groups.
3. Choose as main group the room group with more rooms attached (or the one with more length) and remove the rest.
4. Repeat with main group fixed. Some condition can be set to end the loop. Examples are a fixed number of iterations, or a minimum size of the resulting map. We will be using the last one.

With this approach, we get bigger and **connected** maps. Here there are some samples:

![Testing overlap solver]({{ site.baseurl }}/assets/mapscool.png){: .pure-img .center-image}

We discarded non-connected rooms and extracted a fully connected group of rooms to use as layout for path building.

# Establishing connections

The next step is to actually place room connections. By now, we are assuming that a room block is candidate of being link to other room block if both blocks are touching each other, so what I am going to do is:

1. Precompute all possible connections between pairs of rooms
2. Choose one link for each possibly connected pair of rooms
3. Dance

The results we end up with are the following:

![Linked rooms]({{ site.baseurl }}/assets/mapslink.png){: .pure-img .center-image}

Painted in black you can see all possible links for each room. Painted in green you can see the links that were selected to build a link between rooms.

# Restrictions

Another important feature on this kind of games is the way of getting progress through the game. The player usually have to collect **powerups** in order to be able to perform actions that will provide the player with new ways of traversing rooms and hence, advance in the game, transferring some kind of progress sense to the game.

We can think of a **powerup** as a **restriction** to be solved in order to traverse a specific room or link. A **restriction set** will be used to tag rooms (or links) with abilities needed to be traversed. With this, we have a formal way to tell when a room needs some ability to be traversed. Internally, a restriction set will be represented as a bitset where each position can tell if a given ability is present as a restriction.

As a note, this idea could be transformed later to setting per-link constraint tag instead of per-room. That way, you could set a constraint (ability) needed to reach each link. This might give better results, but by now we will tag only rooms.

# Room provider

A component called **room provider** will be used to choose which rooms the **layout generator** will use as models for the generation. Initially for testing purposes, a random room provider was used: each time we ask the room provider for a room this one will generate a room with random size. Now, we will use properly tagged rooms to work around the feature of needing powerups in order to advance.

# Going wild

Having sparsely defined the approach to build a random layout given a set of rooms. Now we need to build a map with the design ideas we described before. This implies placing pickups and carefully selecting rooms by restrictions when calling the map generator.

To formalize the naming, we will call $$RS_N$$ to the set of rooms tagged with ability restriction set N. The set of rooms with no restrictions will be called $$RS_0$$. We will start generating a layout with rooms of $$RS_0$$. Then, we will perform the next steps for each $$RS_N$$. As how we are using restriction sets right now, every $$RS_N$$ contains $$RS_{N-1}$$. This could have been done without this particular feature, but it makes sense since you progress further in the game as you collect more powerups, you never end up having less powerups than before.

Keep in mind that you could add some rooms with arbitrary number of needed restrictions solved (powerups), but that leads to the need of performing more logic to keep powerups reachable from the spawn point, so I will just keep it simple by now.

We start with a layout generated with $$RS_0$$ rooms, which we will call $$Layout_0$$.

1. Place ability pickup to solve $$RS_{N+1}$$ in one of the generated $$RS_N$$ rooms in $$Layout_N$$.
2. Use $$Layout_N$$ as base for the generator and provide rooms of $$RS_N+1$$
3. Repeat 1 and 2 until last $$RS_N$$.

This way, we build a map in several steps, one for each ability, and properly place the powerups needed for the restriction set $$N$$ in rooms tagged with restriction set $$N-1$$.

# Resume

So I defined some features of metroidvania like games. Then, I explained how the layout generation was going to be approached. Later, I sketched the idea behind using constrained rooms to accomplish the unreachable-until-powered feature, that implies careful room selection when map layout generator is executed and powerup placement. The next topics will be on how to accomplish map transitions when in game and explaining relevant aspects of the game.

Of course we still need to talk about the weapons and the slight RPG touch, and that has something to do with the pickup placement, but I consciously didn't talk about that because it will be target for an incoming post.

See you later!
