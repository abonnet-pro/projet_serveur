#!/bin/bash
pm2 stop 0
git pull
pm2 start main.js