#!/bin/bash
echo "########### Creating SQS Queue ###########"
awslocal sqs create-queue --queue-name transaction-queue --region us-east-1

echo "########### AWS Initialization Complete ###########"