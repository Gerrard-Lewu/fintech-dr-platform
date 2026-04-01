# Step 1: Build and publish the .NET worker
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["ReconciliationService.csproj", "./"]
RUN dotnet restore "ReconciliationService.csproj"
COPY . .
RUN dotnet publish "ReconciliationService.csproj" -c Release -o /app/publish

# Step 2: Run the worker using the .NET runtime
FROM mcr.microsoft.com/dotnet/runtime:10.0
WORKDIR /app
RUN apt-get update && apt-get install -y libgssapi-krb5-2 && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ReconciliationService.dll"]