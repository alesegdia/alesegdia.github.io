---
layout: post
title:  "Demux Devlog 1 - Sketching the idea"
date:   2015-12-20 11:44:37 +0100
categories: gamedev
excerpt_separator: <!--more-->
---

Demux wants to be a shooting platformer using procedurally generated maps. The game should resemble some metroidvania elements to take in mind for the map generation, like having the need of getting an ability to travel to new areas of the map.

<!--more-->

# Where's the action?

The shooting part comes with a slight RPG touch by letting the player spend stat points (SP from now on) on weapon stats and acquiring modifiers during the game to change the weapon bullet behaviour. Weapon stats are:

* bullet's time to live
* bullet's speed
* bullet's power
* shooting rate

 The player spends available SP to increase each stat with a top of 10 with a maximum from 5 to 10. The player will eventually increase this maximum and the number of available SP to spend by collecting specific items.

# Why?

To set a little of context, I started this game for the libgdx jam, but didn't work on the devlog so I didn't submit it. Here I will try to follow those steps. The current state of the game is playable but I won't still release any build because some little tweaking is needed. The generation is working, but highly upgradable. The game has a few bugs right now that are tracked but not addressed currently. Github issues will be used as tracker for bugs and other incidents.

# Enough!

See you in the next post.
