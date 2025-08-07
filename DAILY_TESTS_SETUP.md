# Daily Tests Setup Instructions

## GitHub Secrets Configuration

Aby uruchomić codzienne testy, musisz skonfigurować następujące sekrety w repozytorium GitHub:

### 1. Dodanie Private Key Secret

1. Przejdź do Settings → Secrets and variables → Actions
2. Kliknij "New repository secret"
3. Nazwa: `PRIVATE_KEY`
4. Wartość: Zawartość pliku `private.key` (bez nagłówków, tylko raw bytes w base64 lub hex)

### 2. Konfiguracja Workflow

Workflow jest skonfigurowany do uruchamiania:
- **Codziennie o północy UTC** (01:00 czasu polskiego w zimie, 02:00 w lecie)
- **Ręcznie** przez zakładkę Actions → "Daily Golem Base Tests" → "Run workflow"

### 3. Co testuje workflow:

1. **Instalacja zależności** - `npm ci`
2. **Kompilacja TypeScript** - `npm run build`
3. **Utworzenie entities** - Tworzy przykładowe encje w sieci Golem Base
4. **Walidacja metadanych** - Sprawdza wszystkie assertions:
   - Owner address
   - Expiration block
   - String annotations (xyz=zzz, abc=def dla pierwszej encji; aaa=bbb dla drugiej)
   - Numeric annotations (num=1, favorite=2 dla pierwszej; num=3 dla drugiej)
   - Storage payload ("Welcome to Golem-base!", "Welcome back!")

### 4. Obsługa błędów:

- **Sukces**: Workflow kończy się sukcesem ✅
- **Błąd**: Automatycznie tworzone jest issue z detalami błędu 🐛
- **Artefakty**: Logi i raporty są zachowywane przez 30 dni

### 5. Monitoring:

- Sprawdzaj zakładkę **Actions** w repozytorium
- **Issues** - automatycznie tworzone przy błędach
- **Artifacts** - pobierz szczegółowe logi

## Lokalne uruchamianie

```bash
# Standardowe uruchomienie
npm run app

# Uruchomienie z timeoutem (jak w CI)
npm run test:ci

# Tylko build + uruchomienie
npm run test:daily
```

## Częstotliwość

Workflow uruchamia się o **00:00 UTC** każdego dnia. Możesz zmienić to w pliku `.github/workflows/daily-tests.yml` modyfikując linię cron:

```yaml
# Przykłady:
- cron: '0 12 * * *'  # 12:00 UTC (południe)
- cron: '0 6 * * 1-5' # 06:00 UTC, poniedziałek-piątek
- cron: '0 */6 * * *' # Co 6 godzin
```
