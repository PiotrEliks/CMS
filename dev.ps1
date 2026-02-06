# CMS Project - PowerShell Management Script
# Uzycie: .\dev.ps1 [komenda]

param(
    [Parameter(Position=0)]
    [string]$Command = "help",
    
    [Parameter(Position=1)]
    [string]$Service = ""
)

# Kolory dla outputu
function Write-Success { 
    param($msg) 
    Write-Host "[OK] $msg" -ForegroundColor Green 
}

function Write-Error { 
    param($msg) 
    Write-Host "[ERROR] $msg" -ForegroundColor Red 
}

function Write-Warning { 
    param($msg) 
    Write-Host "[WARNING] $msg" -ForegroundColor Yellow 
}

function Write-Info { 
    param($msg) 
    Write-Host "[INFO] $msg" -ForegroundColor Cyan 
}

function Write-Header { 
    param($msg)
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host "  $msg" -ForegroundColor Cyan
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host ""
}

# Sprawdz czy Docker dziala
function Test-Docker {
    try {
        docker info | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Docker nie dziala!"
            Write-Host "Uruchom Docker Desktop"
            exit 1
        }
    } catch {
        Write-Error "Docker nie jest zainstalowany!"
        Write-Host "Zainstaluj Docker Desktop: https://docs.docker.com/get-docker/"
        exit 1
    }
    
    try {
        docker-compose version | Out-Null
    } catch {
        Write-Error "Docker Compose nie jest zainstalowany!"
        exit 1
    }
}

# START
function Start-Project {
    Write-Header "URUCHAMIANIE PROJEKTU"
    Test-Docker
    
    Write-Info "Buduje i uruchamiam kontenery..."
    docker-compose up --build -d
    
    Write-Host ""
    Write-Success "Projekt zostal uruchomiony!"
    Write-Host ""
    Write-Host "Dostepne serwisy:"
    Write-Host "  Panel Admin:      http://localhost:5173"
    Write-Host "  Strona Publiczna: http://localhost:5175"
    Write-Host "  API Backend:      http://localhost:5000/api"
    Write-Host ""
    Write-Host "Domyslne konta:"
    Write-Host "  Admin:     admin@admin.com / admin!"
    Write-Host "  Moderator: moderator@admin.com / moderator!"
    Write-Host ""
    Write-Info "Uzyj '.\dev.ps1 logs' aby zobaczyc logi"
    Write-Info "Uzyj '.\dev.ps1 status' aby sprawdzic status"
}

# STOP
function Stop-Project {
    Write-Header "ZATRZYMYWANIE PROJEKTU"
    Write-Info "Zatrzymuje kontenery..."
    docker-compose down
    Write-Success "Projekt zostal zatrzymany"
}

# RESTART
function Restart-Project {
    Write-Header "RESTARTOWANIE PROJEKTU"
    Write-Info "Restartuje kontenery..."
    docker-compose restart
    Write-Success "Projekt zostal zrestartowany"
}

# STATUS
function Show-Status {
    Write-Header "STATUS KONTENEROW"
    docker-compose ps
    Write-Host ""
    Write-Info "Szczegolowe informacje:"
    docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
}

# LOGS
function Show-Logs {
    param($svc)
    Write-Header "LOGI APLIKACJI"
    
    if ($svc -eq "") {
        Write-Info "Pokazuje logi wszystkich serwisow (Ctrl+C aby wyjsc)..."
        docker-compose logs -f
    } else {
        Write-Info "Pokazuje logi serwisu: $svc (Ctrl+C aby wyjsc)..."
        docker-compose logs -f $svc
    }
}

# REBUILD
function Rebuild-Project {
    Write-Header "PRZEBUDOWA KONTENEROW"
    
    Write-Warning "To usunie wszystkie kontenery i przebuduje je od zera"
    $response = Read-Host "Czy na pewno chcesz kontynuowac? (y/n)"
    
    if ($response -eq 'y' -or $response -eq 'Y') {
        Write-Info "Zatrzymuje i usuwam kontenery..."
        docker-compose down
        
        Write-Info "Buduje kontenery od nowa (bez cache)..."
        docker-compose build --no-cache
        
        Write-Info "Uruchamiam kontenery..."
        docker-compose up -d
        
        Write-Success "Kontenery zostaly przebudowane i uruchomione"
    } else {
        Write-Info "Anulowano"
    }
}

# CLEAN
function Clean-Project {
    Write-Header "CZYSZCZENIE PROJEKTU"
    
    Write-Host "[WARNING] UWAGA: To usunie WSZYSTKO (kontenery, wolumeny, dane)!" -ForegroundColor Red
    Write-Warning "Baza danych zostanie skasowana!"
    $response = Read-Host "Czy na pewno chcesz kontynuowac? (yes/no)"
    
    if ($response -eq "yes") {
        Write-Info "Usuwam kontenery, wolumeny i sieci..."
        docker-compose down -v --remove-orphans
        
        Write-Info "Usuwam niewykorzystane obrazy..."
        docker image prune -f
        
        Write-Success "Projekt zostal wyczyszczony"
        Write-Host ""
        Write-Info "Uzyj '.\dev.ps1 start' aby uruchomic od nowa"
    } else {
        Write-Info "Anulowano"
    }
}

# SHELL
function Enter-Shell {
    param($svc)
    
    if ($svc -eq "") {
        Write-Error "Musisz podac nazwe serwisu!"
        Write-Host "Uzycie: .\dev.ps1 shell [service]"
        Write-Host "Dostepne serwisy: backend, admin-panel, public-site, postgres"
        exit 1
    }
    
    Write-Header "KONSOLA KONTENERA: $svc"
    docker-compose exec $svc sh
}

# DB BACKUP
function Backup-Database {
    Write-Header "BACKUP BAZY DANYCH"
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $filename = "backup_$timestamp.sql"
    
    Write-Info "Tworze backup: $filename"
    docker-compose exec -T postgres pg_dump -U postgres CMSDatabase > $filename
    
    Write-Success "Backup zapisany: $filename"
}

# DB RESTORE
function Restore-Database {
    param($file)
    
    if ($file -eq "") {
        Write-Error "Musisz podac sciezke do pliku backup!"
        Write-Host "Uzycie: .\dev.ps1 db-restore [plik.sql]"
        exit 1
    }
    
    Write-Header "RESTORE BAZY DANYCH"
    
    Write-Warning "To nadpisze obecna baze danych!"
    $response = Read-Host "Czy na pewno chcesz kontynuowac? (y/n)"
    
    if ($response -eq 'y' -or $response -eq 'Y') {
        Write-Info "Przywracam baze z: $file"
        Get-Content $file | docker-compose exec -T postgres psql -U postgres CMSDatabase
        
        Write-Success "Baza danych zostala przywrocona"
    } else {
        Write-Info "Anulowano"
    }
}

# HELP
function Show-Help {
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "  CMS Project - Skrypt Zarzadzania (PowerShell)" -ForegroundColor Green
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Uzycie:" -ForegroundColor Yellow
    Write-Host "  .\dev.ps1 [komenda] [opcje]"
    Write-Host ""
    Write-Host "Dostepne komendy:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  start              " -ForegroundColor Green -NoNewline; Write-Host "Uruchom caly projekt"
    Write-Host "  stop               " -ForegroundColor Green -NoNewline; Write-Host "Zatrzymaj projekt"
    Write-Host "  restart            " -ForegroundColor Green -NoNewline; Write-Host "Zrestartuj projekt"
    Write-Host "  status             " -ForegroundColor Green -NoNewline; Write-Host "Pokaz status kontenerow"
    Write-Host "  logs [service]     " -ForegroundColor Green -NoNewline; Write-Host "Pokaz logi"
    Write-Host "  rebuild            " -ForegroundColor Green -NoNewline; Write-Host "Przebuduj kontenery"
    Write-Host "  clean              " -ForegroundColor Green -NoNewline; Write-Host "Usun wszystko"
    Write-Host "  shell [service]    " -ForegroundColor Green -NoNewline; Write-Host "Wejdz do konsoli kontenera"
    Write-Host "  db-backup          " -ForegroundColor Green -NoNewline; Write-Host "Backup bazy danych"
    Write-Host "  db-restore [file]  " -ForegroundColor Green -NoNewline; Write-Host "Restore bazy"
    Write-Host "  help               " -ForegroundColor Green -NoNewline; Write-Host "Pokaz te pomoc"
    Write-Host ""
    Write-Host "Przyklady:" -ForegroundColor Yellow
    Write-Host "  .\dev.ps1 start"
    Write-Host "  .\dev.ps1 logs backend"
    Write-Host "  .\dev.ps1 shell postgres"
    Write-Host ""
    Write-Host "URL serwisow:" -ForegroundColor Yellow
    Write-Host "  Panel Admin:      http://localhost:5173"
    Write-Host "  Strona Publiczna: http://localhost:5175"
    Write-Host "  API Backend:      http://localhost:5000/api"
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""
}

# Main switch
switch ($Command.ToLower()) {
    "start"      { Start-Project }
    "stop"       { Stop-Project }
    "restart"    { Restart-Project }
    "status"     { Show-Status }
    "logs"       { Show-Logs $Service }
    "rebuild"    { Rebuild-Project }
    "clean"      { Clean-Project }
    "shell"      { Enter-Shell $Service }
    "db-backup"  { Backup-Database }
    "db-restore" { Restore-Database $Service }
    "help"       { Show-Help }
    default {
        Write-Host "[ERROR] Nieznana komenda: $Command" -ForegroundColor Red
        Write-Host ""
        Write-Host "Uzyj '.\dev.ps1 help' aby zobaczyc dostepne komendy"
    }
}