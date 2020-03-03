#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkStack } from '../lib/cdk-stack';

const app = new cdk.App();
new CdkStack(app, 'CdkStack', {
    // Set ENVs for CDK Stack due to use Vpc.fromLookup. we need to specify an account and region anyways.
    // Reference here: https://github.com/aws/aws-cdk/issues/4846
    env: {
        region: process.env.CDK_DEFAULT_REGION,
        account: process.env.CDK_DEFAULT_ACCOUNT
    }
});
