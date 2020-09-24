BASE_DIR=`pwd`
SRC="$BASE_DIR/src"
BUILD_DIR="$BASE_DIR/build"
NWJS_SRC="$SRC/node_modules/nw/nwjs"

# clean build
mkdir -p $BUILD_DIR
rm -rf $BUILD_DIR/*

# copy new files to install root
cp -r $NWJS_SRC/* $BUILD_DIR
cp -r $SRC/client $SRC/app.js $SRC/package.json $BUILD_DIR

# remove unwanted files
cd $BUILD_DIR
mv nw rebel
rm -rf credits.html crashpad_handler
cd locales
shopt -s extglob
rm -rf !(en-US*)

echo "Building complete."
