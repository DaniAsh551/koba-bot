#!/bin/sh

rm -f ./src/.env

if [ $# -eq 0 ]; then
    echo Swithing to DBG
    ln ./src/.env_dbg ./src/.env
else
    echo Swithing to PRD
    ln ./src/.env_prd ./src/.env
fi