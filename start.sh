#!/bin/bash

# Usage:
#   HOST=127.0.0.1 PORT=5051 TITLE=HALL-B ./start.sh

cd "$(dirname "$0")"

NODE_ENV=production node app.js
