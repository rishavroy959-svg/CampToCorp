Write-Host "Extracting PostgreSQL binaries using tar.exe..."
tar.exe -xf "c:\Hackathon\pgsql.zip" -C "c:\Hackathon"

if (-not (Test-Path "c:\Hackathon\pgsql\bin\initdb.exe")) {
    Write-Error "initdb.exe not found at c:\Hackathon\pgsql\bin\initdb.exe"
    exit 1
}

Write-Host "Initializing PostgreSQL cluster..."
if (-not (Test-Path "c:\Hackathon\pgsql\data")) {
    & "c:\Hackathon\pgsql\bin\initdb.exe" -D "c:\Hackathon\pgsql\data" -U postgres -E UTF8 --locale=C -A trust
}

Write-Host "Starting PostgreSQL daemon on port 5432..."
& "c:\Hackathon\pgsql\bin\pg_ctl.exe" -D "c:\Hackathon\pgsql\data" -l "c:\Hackathon\pgsql\server.log" -o "-p 5432" start

Start-Sleep -Seconds 3

Write-Host "Verifying TCP connection on port 5432..."
$test = Test-NetConnection -ComputerName 127.0.0.1 -Port 5432
if (-not $test.TcpTestSucceeded) {
    Write-Error "Failed to connect to PostgreSQL on port 5432"
    exit 1
}

Write-Host "PostgreSQL is online! Creating database 'camptocorp'..."
& "c:\Hackathon\pgsql\bin\createdb.exe" -U postgres -p 5432 camptocorp 2>&1

Write-Host "PostgreSQL setup complete!"
