 # CMS Project - Setup

> **Projekt na przedmiot CMS** - System zarządzania treścią z panelem administracyjnym, stroną publiczną i API.

## 📋 Wymagania

- **Docker** (wersja 20.10+)
- **Porty 5000, 5173, 5175, 5432** muszą być wolne

### Sprawdź czy masz Docker:

```bash
docker --version
docker-compose --version
```

## 🚀 Szybki Start (3 kroki)

### 1️⃣ Sklonuj repozytorium

```bash
git clone https://github.com/PiotrEliks/CMS.git
```

### 2️⃣ Skonfiguruj zmienne środowiskowe

To poprawnego działania edytuj plik `docker-compose.yml`:
Znajdź sekcje `environment:` i ustaw wypisane zmienne środowiskowe.

### 3️⃣ Uruchom projekt

```bash
.\dev.ps1 start
```

## 🌐 Dostęp do aplikacji

Po uruchomieniu otwórz w przeglądarce:

| Komponent | URL | Opis |
|-----------|-----|------|
| 🎨 **Panel Admin** | http://localhost:5173 | Interfejs zarządzania CMS |
| 🌍 **Strona Publiczna** | http://localhost:5175 | Frontend dla użytkowników |
| ⚙️ **API Backend** | http://localhost:5000/api | REST API |
| 🗄️ **PostgreSQL** | localhost:5432 | Baza danych |

### 🔐 Domyślne konta:

| Rola | Email | Hasło |
|------|-------|-------|
| **Administrator** | admin@admin.com | `admin!` |
| **Moderator** | moderator@admin.com | `moderator!` |

---

## 🛠️ Komendy zarządzania

Projekt zawiera różne skrypty zarządzania:

### Windows (PowerShell)

```powershell
.\dev.ps1 start      # Uruchom wszystko
.\dev.ps1 stop       # Zatrzymaj wszystko
.\dev.ps1 restart    # Zrestartuj wszystko
.\dev.ps1 logs       # Pokaż logi
.\dev.ps1 status     # Status kontenerów
.\dev.ps1 rebuild    # Przebuduj kontenery od zera
.\dev.ps1 clean      # Usuń wszystko
.\dev.ps1 shell   # Wejdź do kontenera