---
layout: post
title:  "A learning experience with mesa project."
date:   2015-8-3 13:44:37 +0100
categories: lisp gamedev
excerpt_separator: <!--more-->
---
Recently, I've been interested on starting to contribute to the mesa project. My current knowledge is not enough to do great stuff, but I would learn a lot for sure, and here it is my first experience.

I've learnt about some topics related to the workflow needed to contributing at a big project like mesa, like sending patches with git. I have been using git for quite a while on personal projects, informal projects with people and a little more formal projects at work, but I don't stop learning, and got a few tricks here.

<!--more-->


<h1>Setting up the repos.</h1>
First of all, it's good to have your own remote repository to place all the changes before submitting a patch. I created a new empty github repo for this task. Then, I had to set up both remotes (my github repo and the official freedesktop mesa).
<pre># create clean local git repository
$ mkdir mesa
$ cd mesa
$ git init

# add both remotes, github and freedesktop
$ git remote add github git@github.com:alesegdia/mesa.git
$ git remote add freedesktop git://anongit.freedesktop.org/mesa/mesa

# fetch freedesktop state and pull changes into local repo
$ git fetch freedesktop master
$ git pull freedesktop master

# update github repo with all the history from freedesktop repo
$ git push --all github</pre>
With all that set, then I proceeded to make those little changes needed for the task. It was a small task, suitable for a warm-up, and it consisted on changing the use of an old hash table for a new faster one. I won't go into details for that.
<h1>Testing it out.</h1>
Once the changes are done, testing them is a must, but first things first. We need to compile the project. Mesa people have chosen autotools for this task.
<pre>$ ./autogen.sh
$ ./configure --prefix=/home/me/mesainstall
$ make -j8
$ make install</pre>
Then, to test our freshly compiled lib, we have to tell the system to use the folder it's in. For that, we make use of LD_LIBRARY_PATH environment variable.
<pre>$ export LD_LIBRARY_PATH=/home/me/mesainstall/lib</pre>
Now, every GL app will use our compiled lib. Coming back to where we were, we need to run some tests in order to check that we did a good job. For that purpose, mesa has some tests inside the repo [1].
<pre>$ make check</pre>
We have to take into account that some tests may fail even for a clean tree. This may be because of features not made, or work in progress, so we need to perform the tests <strong>before</strong> and <strong>after</strong> using our newly compiled mesa driver, and compare then.

There is also a test framework called <strong>piglit</strong> [2] that let us get fancy outputs and run a subset of tests by category. For this change, I just needed to run the glslparser tests after having properly built piglit. There are some flags added taken from [3] to avoid some hangs on X you can have.
<pre>$ ./piglit-run.py -x glx -x streaming-texture-leak -1 --dmesg tests/glslparse.py \
	~/piglit-results/output</pre>
As I mentioned earlier, I ran this test with and without the changes. I got the same output so I took that as a guarantee that I did things ok.
<h1>Sending patches via email.</h1>
After making those changes, I commited them. In order to submit patches for review, git-send-email comes in handy. First of all, you need to set up your config to be able to send emails [4].
<pre><code># global email server settings
$ git config --global sendemail.smtpencryption tls
$ git config --global sendemail.smtpserver mail.messagingengine.com
$ git config --global sendemail.smtpuser user@server.com
$ git config --global sendemail.smtpserverport 587

# local email recipient address setting
$ git config sendemail.to mesa-dev@lists.freedesktop.org</code></pre>
At this point, everything is good to send patches by email. The next step was to actually send the patch by mail. This can be done in two ways. The first one does the whole thing in one step.<code> </code>
<pre><code>$ git send-email -1 &lt;commit reference&gt;</code></pre>
Where N is the number of commits to send within the patch, and &lt;commit reference&gt; the commit where it counts. This will build a mail and send it at once, but we can split this in two steps if we want, in order to elaborate a little more with the message.
<pre># build the email
$ git format-patch -1 &lt;commit reference&gt;

# edit it
$ vim 0001-first-commit-line.patch

# actually send it
$ git send-email 0001-first-commit-line.patch</pre>
And that's it, patch sent to the mailing list!
<h1>Rebasing, not so evil.</h1>
So I've always heard about the evilness of rebasing, but I just found out it's a really cool feature thanks to mesa people at freenode. It can break a repo though, but since we're working on a personal branch at github before actually commiting to the official mesa repo, there was no problem with it.

I was told a few things to change in my commit, and a few more commits were pushed to the official mesa repo. I had already pulled them to local, then pushed to github, so I thought I was in trouble. Luckily I was told about rebase to fix my commit.
<pre>$ git rebase --interactive HEAD~6
$ <code>git rebase --interactive </code>3a28098<code>^</code></pre>
Rebase let you perform some actions from some commit to HEAD. With this instruction, we wanted to do that from six commits back from HEAD, but you can use a commit reference hash as well [5].
<pre>pick 3a28098 glsl: replace old hash table with new and faster one
pick 111b69c radeonsi: flush if the memory usage for an IB is too high
pick 366c590 r600g: fix the single-sample fast clear setup
pick 24c4455 r600g: fix the CB_SHADER_MASK setup
pick 803cc5a r600g: re-enable single-sample fast clear

# Rebase 4d7e0fa..803cc5a onto 4d7e0fa (5 command(s))
#
# Commands:
# p, pick = use commit
# r, reword = use commit, but edit the commit message
# e, edit = use commit, but stop for amending
# s, squash = use commit, but meld into previous commit
# f, fixup = like "squash", but discard this commit's log message
# x, exec = run command (the rest of the line) using shell
#
# These lines can be re-ordered; they are executed from top to bottom.
#
# If you remove a line here THAT COMMIT WILL BE LOST.
#
# However, if you remove everything, the rebase will be aborted.
#
# Note that empty commits are commented out</pre>
To be honest, at first I wanted to study the rebase command a little more before doing anything, so I ZZed it. I pushed the changes made so I had commits duplicated. I undid those duplicated commits [6] and took it slower.
<pre><code>$ git reset HEAD~5
$ git push --force github</code></pre>
The danger there resides at forced git push, since it rewrites github with what we have at the local repo, but knowing what we're doing, there's no need to fear. Anyway, I read more carefully about rebase docs with the --interactive option, and you are able to perform some commands on previous commits to rewrite history.
<pre>(...)
<strong>edit</strong> 3a28098 glsl: replace old hash table with new and faster one
(...)
ZZ

$ vim src/file.cpp
$ git add src/file.cpp
$ git commit -m "new commit message"</pre>
I needed to <strong>edit</strong> the commit, so that I could edit the file to apply those little style changes. Made a new commit with a more elaborated message. Then pushed forcing and the history was rewritten, but that way, two commits were made: one with the previous changes and another before that one with the little style change.

This was not what I intended to do, since I wanted one commit with all changes, so I executed rebase again to fix it. There is the <strong>squash</strong> command for this purpose.
<pre>(...)
pick 3a28098 glsl: replace old hash table with new and faster one
<strong>squash</strong> 4bc4356 glsl: fancier new message
(...)
ZZ</pre>
Then, an editor view is prompted to be able to mix both commit messages. When saving, both commits are squashed into one, and the new commit message is associated. Before this, the interactive mode lets you perform a few commands:
<ul>
	<li>--continue: until the next instruction needing user interaction</li>
	<li>--abort: all rebase commands</li>
	<li>--skip: this current rebase command</li>
</ul>
<pre># edit commit message
$ git rebase --continue
$ git push --force github</pre>
And that's it! history rewritten.
<h1>Lessons learnt.</h1>
This was a great learning experience, and I just wanted to write it down. The workflow to submit patches sending mails and a little more git knowledge were definitely worth. From now on, I hope further learning into actual mesa drivers architecture.
<h6>[1] http://www.mesa3d.org/devinfo.html</h6>
<h6>[2] http://piglit.freedesktop.org/</h6>
<h6>[3] http://people.freedesktop.org/~imirkin/</h6>
<h6>[4] http://www.freedesktop.org/wiki/Software/PulseAudio/HowToUseGitSendEmail/</h6>
<h6>[5] http://stackoverflow.com/questions/1186535/how-to-modify-a-specified-commit-in-git</h6>
