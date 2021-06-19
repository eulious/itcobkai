#!/bin/bash

(cd lambda; zip -r lambda.zip *.py)
aws lambda update-function-code \
    --function-name itcobkai \
    --zip-file fileb://lambda/lambda.zip
rm lambda/lambda.zip
