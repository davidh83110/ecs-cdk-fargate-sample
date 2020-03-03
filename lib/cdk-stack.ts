import * as cdk from '@aws-cdk/core';
import ecs = require('@aws-cdk/aws-ecs');
import ec2 = require('@aws-cdk/aws-ec2')
import elbv2 = require('@aws-cdk/aws-elasticloadbalancingv2');

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromLookup(this, 'vpc', {
      vpcName: "sample-vpc"
    })

    const cluster = new ecs.Cluster(this, 'cluster', {
      vpc
    })

    const taskDef = new ecs.FargateTaskDefinition(this, 'task', {
      memoryLimitMiB: 512,
      cpu: 256
    })

    const container = taskDef.addContainer('container', {
      image: ecs.ContainerImage.fromRegistry('nginxdemos/hello:latest'),
      memoryLimitMiB: 512,
      memoryReservationMiB: 256
    })

    container.addPortMappings({
      containerPort: 80
    })

    const ecsService = new ecs.FargateService(this, 'service', {
      cluster,
      taskDefinition: taskDef,
      desiredCount: 1,
      vpcSubnets: {
        subnetName: 'private'
      }
    })

    const lb = new elbv2.ApplicationLoadBalancer(this, 'LB', {
      vpc,
      vpcSubnets: {
        subnetName: 'public'
      },
      internetFacing: true
    })

    const listener = lb.addListener('listener', {
      protocol: elbv2.ApplicationProtocol.HTTP,
      port: 80,
      open: true
    })

    listener.addTargets('tg', {
      port: 80,
      targets: [ecsService],
      deregistrationDelay: cdk.Duration.seconds(10),
      healthCheck: {
        path: '/',
        interval: cdk.Duration.seconds(5),
        timeout: cdk.Duration.seconds(4),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 2,
        healthyHttpCodes: '200'
      }
    })

  }
}
