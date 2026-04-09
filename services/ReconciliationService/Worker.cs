using MongoDB.Driver;
using Npgsql;
using Prometheus;

namespace ReconciliationService;

public class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;
    private readonly string _pgConn = Environment.GetEnvironmentVariable("PG_CONN") ?? "Host=localhost;Username=admin;Password=Strangerthings06;Database=ledger_db";
    private readonly string _mongoConn = Environment.GetEnvironmentVariable("MONGO_CONN") ?? "mongodb://admin:Strangerthings06@localhost:27017";

    private static readonly Gauge PgLedgerGauge = Metrics
        .CreateGauge("fintech_postgres_ledger_count", "Current records in Postgres Ledger");

    private static readonly Gauge MongoEventGauge = Metrics
        .CreateGauge("fintech_mongodb_event_count", "Current records in MongoDB Event Log");

    public Worker(ILogger<Worker> logger) => _logger = logger;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation("Reconciliation Check started at: {time}", DateTimeOffset.Now);
            
            try {
                // Check Postgres Count
                using var conn = new NpgsqlConnection(_pgConn);
                await conn.OpenAsync();
                using var cmd = new NpgsqlCommand("SELECT COUNT(*) FROM transactions", conn);
                var pgCountRaw = await cmd.ExecuteScalarAsync();
                double pgCount = Convert.ToDouble(pgCountRaw ?? 0);

                // UPDATE THE METRICS
                PgLedgerGauge.Set(pgCount);

                // Check Mongo Count
                var client = new MongoClient(_mongoConn);
                var db = client.GetDatabase("admin");
                var collection = db.GetCollection<dynamic>("eventlogs");
                var mongoCount = await collection.CountDocumentsAsync(_ => true);

                // UPDATE THE METRICS
                MongoEventGauge.Set(mongoCount);

                _logger.LogWarning($"[RECO] Postgres: {pgCount} | MongoDB: {mongoCount}");
                
                if (pgCount != mongoCount) {
                    _logger.LogError("!!! DISCREPANCY DETECTED !!! Data is out of sync.");
                } else {
                    _logger.LogInformation("Check passed. Systems are in sync.");
                }
            } catch (Exception ex) {
                _logger.LogError($"Reconciliation failed: {ex.Message}");
            }

            await Task.Delay(10000, stoppingToken); 
        }
    }
}