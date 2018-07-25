#! /bin/bash

gittop=$(git rev-parse --show-toplevel)
cd $gittop
ln --symbolic ./githooks/pre-commit .git/hooks
