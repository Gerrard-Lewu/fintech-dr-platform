using Prometheus;
using ReconciliationService;

var builder = Host.CreateApplicationBuilder(args);

var metricServer = new MetricServer(hostname: "*", port: 5000);
metricServer.Start();

builder.Services.AddHostedService<Worker>();

var host = builder.Build();
host.Run();