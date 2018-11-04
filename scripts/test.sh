#! /bin/bash

# Launch ganache
#
# -l gas limit: set to full
# -i network id: set to 15 (polymath has this hard coded)
# -m mnemonic: set to default to keep accounts the same
#
# will write std out and error to ganache.log (ignored in git)
ganache-cli \
  -l 0xffffff \
  -i 15 \
  -m "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat" \
  &> ganache.log &


# Setup submodules
git submodule init && git submodule update

# Change context to polymath directory
cd polymath-core

# Deploy contracts to development network
truffle migrate --network development # need to make sure truffle installed and version < 5

# Change context back to application root
cd $OLDPWD

# Copy privKeyLocal (polymath requirement) to root of submodule
cp ./test/support/privKeyLocal polymath-core/privKeyLocal

# Copy STO config to polymath
cp ./test/support/capped_sto_data.yml polymath-core/CLI/data/capped_sto_data.yml

# Run the tests
tsc -p tsconfig.test.json && node_modules/.bin/mocha dist-test/* -t 10000

# End ganache process
kill %%

