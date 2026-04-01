using MongoDB.Driver;
using Npgsql;

namespace ReconciliationService;

public class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;
    private readonly string _pgConn = Environment.GetEnvironmentVariable("PG_CONN") ?? "Host=localhost;Username=admin;Password=Strangerthings06;Database=ledger_db";

    private readonly string _mongoConn = Environment.GetEnvironmentVariable("MONGO_CONN") ?? "mongodb://admin:Strangerthings06@localhost:27017";

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
                var pgCount = await cmd.ExecuteScalarAsync();

                // Check Mongo Count
                var client = new MongoClient(_mongoConn);
                var db = client.GetDatabase("admin");
                var collection = db.GetCollection<dynamic>("eventlogs");
                var mongoCount = await collection.CountDocumentsAsync(_ => true);

                _logger.LogWarning($"[RECO] Postgres: {pgCount} | MongoDB: {mongoCount}");
                
                if (pgCount?.ToString() != mongoCount.ToString()) {
                    _logger.LogError("!!! DISCREPANCY DETECTED !!! Data is out of sync.");
                } else {
                    _logger.LogInformation("Check passed. Systems are in sync.");
                }
            } catch (Exception ex) {
                _logger.LogError($"Reconciliation failed: {ex.Message}");
            }

            await Task.Delay(10000, stoppingToken); // Wait 10 seconds
        }
    }
}