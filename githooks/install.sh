#! /bin/bash

gittop=$(git rev-parse --show-toplevel)
cd $gittop
ln --symbolic $gittop/githooks/pre-commit .git/hooks
