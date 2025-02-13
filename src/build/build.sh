#******************************************************************************#
#                                                                              #
#                                   build.sh                                   #
#                                                                              #
#******************************************************************************#
#                                                                              #
#        This script compresses and concatenates the scripts, styles           #
#        and resources that are contained in a Sharedigm instance.             #
#                                                                              #
#        Author(s): Abe Megahed                                                #
#                                                                              #
#        This file is subject to the terms and conditions defined in           #
#        'LICENSE.md', which is part of this source code distribution.         #
#                                                                              #
#******************************************************************************#
#        Copyright (C) 2016-2024, Megahed Labs LLC, www.sharedigm.com          #
#******************************************************************************#

# define directories
#
src=../../indiesource
dest=../../indiesource-built

#
# functions
#

function make_copy() {
	rm -rf $2
	cp -r $1 $2
}

#******************************************************************************#
#                          script building functions                           #
#******************************************************************************#

function bundle_scripts() {
	scripts=$1

	# bundle script files together
	#
	rm -rf $scripts
	mkdir $scripts
	rollup --config rollup.config.js --bundleConfigAsCjs
}

function compress_scripts() {
	scripts=$1

	# minify each script file
	#
	for filename in $scripts/*.js; do
		echo "minifying script $filename"
		terser --compress --mangle --ecma 6 $filename -o $filename 
	done
}

function build_scripts() {
	scripts=$1
	bundle_scripts $scripts
	compress_scripts $scripts
}

#******************************************************************************#
#                           style building functions                           #
#******************************************************************************#

function clean_styles() {
	styles=$1

	# remove unused less folders
	#
	for item in "$styles"/*; do
		if [ -d "$item" ]; then
			if [[ $item != *themes ]]; then
				rm -rf "$item"
			fi
		fi
	done

	# remove development files
	#
	for file in $(find $styles -name '*.less' -or -name '*.scss' -or -name '*.map' -or -name 'makefile'); do rm $file; done

	# remove all empty directories
	#
	find $styles -name ".DS_Store" -depth -exec rm {} \;
	find $styles -type d -empty -print -delete
}

function compress_styles() {
	styles=$1

	# compress each styles file
	#
	for item in "$styles"/*;do
		if [ -d "$item" ];then
			compress_styles "$item"
		elif [ -f "$item" ]; then
			if [[ "$item" == *.css ]]; then
				echo "minifying styles $item"
				cssmin $item > temp
				rm $item
				mv temp $item
			fi
		fi
	done
}

function build_styles() {
	styles=$1
	clean_styles $styles
	compress_styles $styles
}

#******************************************************************************#
#                                     main                                     #
#******************************************************************************#

# create built copy
#
make_copy $src $dest
build_scripts "$dest/scripts"
build_styles "$dest/styles"