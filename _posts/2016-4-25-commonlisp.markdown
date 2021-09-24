---
layout: post
title:  Quick recipe on preparing a Lisp environment
date:   2016-5-10 13:44:37 +0100
categories: lisp
tags: lisp
excerpt_separator: <!--more-->
---

Some time ago I studied a little of Lisp for fun, and recently I found this lisp game jam. Jumping into graphics could be an overkill, so if I ended up participating with a text based game. There is a C lib to easily handle a terminal, and it looks like some folk made a wrapper to lisp. Thanks to people at #lispgames @freenode, very helpful.

In this post, I'll show the steps I followed in order to configure my environment with Lisp, Emacs and package managers. I won't cover the steps in detail, but just plainly list them in order to help me in further installations.

<!--more-->

### Installing SBCL

Go to the [SBCL page](http://www.sbcl.org/) and download latest version. Unzip at `/opt` and execute the install script inside.

### Installing Emacs

Emacs is available directly from most Linux distribution repositories.

### Installing QuickLisp

To install QuickLisp, [read their starter guide](https://www.quicklisp.org/beta/), it's quick and gave me no problems.

### Installing Slime

Now is when the problems come. I remember this part specially being difficult to accomplish in the past when retaking Lisp, but this time was lighter thanks to people at #lispgames. Basically there is [a helper that does all the hard work for us](https://github.com/quicklisp/quicklisp-slime-helper).

### Add MELPA repositories to emacs

Add these lines to .emacs:

```
(require 'package)
(add-to-list 'package-archives '("melpa" . "http://melpa.org/packages/"))
(package-initialize)
```

## Last words

I did not finish the game but I had a good time refreshing and using Lisp. The game code can be found [at github](http://github.com/alesegdia/lispjam-16).
