#!/bin/bash

#systemctl stop php56-php-fpm.service
#systemctl stop httpd.service

rm -rf /appdata/app/public/

if [ -e /etc/httpd/conf.d/app.conf ]; then
   rm -f /etc/httpd/conf.d/app.conf
fi

if [ -e /etc/httpd/conf.d/default.conf ]; then
    rm /etc/httpd/conf.d/default.conf
fi

