---
layout: post
title:  "Coverage tests with gcov"
date:   2015-12-22 15:44:37 +0100
categories: c++ gcc tdd
excerpt_separator: <!--more-->
---

Recently I discovered test-driven development and sincerely, I felt like if I had discovered the philosopher stone. Something very useful when approaching development this way are coverage tests in order to check which parts of your code are actually being tested and which are just being skipped.

For this task, one of the available open source options is `gcov`, that basically collects coverage data from an application execution (ideally a test).

<!--more-->

# Generating coverage data
First of all, we need to add the `--coverage` flag to the compiler and the linker so that `gcc` can generate information for coverage checking [^1].

[^1]: `--coverage` flag is a shortcut for other flags. [More info here](https://gcc.gnu.org/onlinedocs/gcc/Debugging-Options.html)

Once we have our test compiled with these flags, `.gcno` files will be generated. Then, when we run the test and the test execution ends **cleannly**, a another set of `.gcda` files will be generated [^2].

[^2]: [More information about `.gcda` and `.gcno` files](https://gcc.gnu.org/onlinedocs/gcc-4.1.0/gcc/Gcov-Data-Files.html)

# Reading coverage data

With `.gcno` and `.gcda` files generated, we have all the needed information to check for coverage of the executed test. To make a quick check on how much of our code is covered:

```
gcov cppfile.gcda
```

This way we get a quick resume of coverage. If we open the generated `cppfile.cpp.gcov` file, we can see how many times each line was executed. This is specially useful to know which lines have not been executed and hence, improve our test to force those parts. Also, when a line has not been executed, we will see a `#####` symbol at the start of the line.

# Visualizing coverage data

So now we have generated all needed information, but we can still achieve a better presentation for it. For this task, a few tools are available like `lcov` and `gcovr`.

Here, I will show `lcov` since it is capable of generating a very nice HTML output with all the needed information about the coverage. To use `lcov` in order to generate a full report:

```
lcov --base-directory . --directory . --capture --output-file lcovdata.info
```

* `--base-directory`: is the directory to use as base for relative paths
* `--directory`: is the directory containing the `.gcda` files
* `--capture`: tells `lcov` to capture coverage data from previously generated files
* `--output-file`: the output file with the necessary information for `lcov` to generate a report

Please note that there is no need to run `gcov` manually if we are using `lcov`, basically because `lcov` runs `gcov` internally for us. Once we have the `lcovdata.info` file, we can generate the report.

```
genhtml -o /tmp/outputfolder lcovdata.info
```

And finally we can open the generated HTML report, where all the info about coverage is present in a nicer than plain text format.

Hope it helped!

#### External references

* [Michael Stapelberg's blog](http://michael.stapelberg.de/Artikel/code_coverage_with_lcov/), where all of this is much better explained.

* [GCC's official documentation](https://gcc.gnu.org/onlinedocs/gcc-3.2/gcc/Invoking-Gcov.html)

#### Footnotes
