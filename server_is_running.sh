#!/bin/bash

if pgrep -x "node" > /dev/null; then
    echo "Server is running"
else
    echo "Server is stopped"
fi

