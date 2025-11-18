# 🧪 TEST PASSO-PASSO - Stremizio Addon

Guida completa per testare tutte le funzionalità in modo sequenziale e verificabile.

---

## 📋 **LEGENDA SIMBOLI**

- ✅ Test completato con successo
- 🔴 Test fallito - richiede fix
- ⏳ Test in corso
- ⏭️ Test skippato (non applicabile)
- 🔧 Richiede setup iniziale

---

## 🎯 **PRIORITÀ 1: SETUP & DEPLOY (Da fare OGGI)**

### Test S1: Deploy Daily Scraper ✅ CRITICO

**Obiettivo**: Verificare che il daily scraper funzioni correttamente sul server

**Prerequisiti**:
- Server remoto attivo
- Database PostgreSQL configurato
- Accesso SSH al server

**Steps**:

1. **Copia file aggiornati sul server**
```bash
# Dal tuo Mac
cd /Users/eschiano/Documents/Fatture\ asilo/itaevent/stremizio_show

# Copia daily-scraper.js
scp -i ~/.ssh/ssh-key-vps2.key daily-scraper.js ubuntu@89.168.25.177:/home/ubuntu/stremizio-scraper/

# Copia id-converter.cjs
scp -i ~/.ssh/ssh-key-vps2.key lib/id-converter.cjs ubuntu@89.168.25.177:/home/ubuntu/stremizio-scraper/lib/
```

2. **Verifica file sul server**
```bash
ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177
cd /home/ubuntu/stremizio-scraper
ls -la daily-scraper.js
ls -la lib/id-converter.cjs
```

3. **Test dry-run (prima pagina solo)**
```bash
# Modifica temporanea maxPages = 1
nano daily-scraper.js
# Cambia: const maxPages = 20; -> const maxPages = 1;

# Esegui test
node daily-scraper.js 2>&1 | tee test-s1-output.log
```

4. **Verifica output atteso**

Cerca nel log:
```
✅ PASS: Log mostra "📄 Page 1/1: https://ilcorsaronero.link/latest"
✅ PASS: Trova ~25 torrents sulla pagina
✅ PASS: Filtra correttamente (NO Musica, NO Libri, NO Software)
✅ PASS: stats.totalScraped = numero corretto (non 2500!)
✅ PASS: Nessun errore "Cannot find module './lib/id-converter.cjs'"
```

5. **Copia qui il log output**
```
[INCOLLA LOG QUI]
```

**✅ PASS Criteria**:
- [⏭️] File copiati correttamente
- [⏭️] Log mostra `📄 Page 1/1`
- [⏭️] Processa ~25 torrents (non 100+)
- [⏭️] Categorie filtrate correttamente
- [⏭️] id-converter caricato senza errori

**🔴 FAIL Actions**:
- Se errore module: verifica path `lib/id-converter.cjs`
- Se processa 100+ torrents: verifica `maxPages` nel file server
- Se non filtra categorie: verifica whitelist categorie


⏭️ test gia eseguito senza le info!!! assare al prossimo
---

### Test S2: Verifica id-converter Funziona ✅ CRITICO

**Obiettivo**: Testare conversione IMDb↔TMDb in entrambe le direzioni

**Steps**:

1. **Test sul server**
```bash
ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177

cd /home/ubuntu/stremizio-scraper

# Test 1: IMDb → TMDb
node -e "
const {imdbToTmdb} = require('./lib/id-converter.cjs');
imdbToTmdb('tt0111161').then(r => console.log('Test 1 IMDb→TMDb:', r));
"

# Test 2: TMDb → IMDb
node -e "
const {tmdbToImdb} = require('./lib/id-converter.cjs');
tmdbToImdb(278, 'movie').then(r => console.log('Test 2 TMDb→IMDb:', r));
"

# Test 3: completeIds (solo IMDb)
node -e "
const {completeIds} = require('./lib/id-converter.cjs');
completeIds('tt0111161', null, 'movie').then(r => console.log('Test 3 Complete (IMDb only):', r));
"

# Test 4: completeIds (solo TMDb)
node -e "
const {completeIds} = require('./lib/id-converter.cjs');
completeIds(null, 278, 'movie').then(r => console.log('Test 4 Complete (TMDb only):', r));
"

exit
```

2. **Output atteso**
```
Test 1 IMDb→TMDb: { tmdbId: 278, type: 'movie' }
Test 2 TMDb→IMDb: tt0111161
Test 3 Complete (IMDb only): { imdbId: 'tt0111161', tmdbId: 278 }
Test 4 Complete (TMDb only): { imdbId: 'tt0111161', tmdbId: 278 }
```

3. **Incolla output qui**
```
ubuntu@aio:~$ cd stremizio-scraper/
ubuntu@aio:~/stremizio-scraper$ node -e "
const {imdbToTmdb} = require('./lib/id-converter.cjs');
imdbToTmdb('tt0111161').then(r => console.log('Test 1 IMDb→TMDb:', r));
"
🔄 Converting IMDb→TMDb: tt0111161
✅ IMDb tt0111161 → TMDb 278 (movie)
Test 1 IMDb→TMDb: { tmdbId: 278, type: 'movie' }
ubuntu@aio:~/stremizio-scraper$ node -e "
const {tmdbToImdb} = require('./lib/id-converter.cjs');
tmdbToImdb(278, 'movie').then(r => console.log('Test 2 TMDb→IMDb:', r));
"
🔄 Converting TMDb→IMDb: 278 (movie)
✅ TMDb 278 → IMDb tt0111161
Test 2 TMDb→IMDb: tt0111161
ubuntu@aio:~/stremizio-scraper$ node -e "
const {completeIds} = require('./lib/id-converter.cjs');
completeIds('tt0111161', null, 'movie').then(r => console.log('Test 3 Complete (IMDb only):', r));
"
🔄 Only IMDb present (tt0111161), converting to TMDb...
🔄 Converting IMDb→TMDb: tt0111161
✅ IMDb tt0111161 → TMDb 278 (movie)
Test 3 Complete (IMDb only): { imdbId: 'tt0111161', tmdbId: 278 }
ubuntu@aio:~/stremizio-scraper$ node -e "
const {completeIds} = require('./lib/id-converter.cjs');
completeIds(null, 278, 'movie').then(r => console.log('Test 4 Complete (TMDb only):', r));
"
🔄 Only TMDb present (278), converting to IMDb...
🔄 Converting TMDb→IMDb: 278 (movie)
✅ TMDb 278 → IMDb tt0111161
Test 4 Complete (TMDb only): { imdbId: 'tt0111161', tmdbId: 278 }
ubuntu@aio:~/stremizio-scraper$
```

**✅ PASS Criteria**:
- [✅] Test 1: Converte IMDb → TMDb correttamente
- [✅] Test 2: Converte TMDb → IMDb correttamente
- [✅] Test 3: completeIds popola TMDb quando mancante
- [✅] Test 4: completeIds popola IMDb quando mancante

---

### Test S3: Daily Scraper Full Run (20 pagine) 🔧 IMPORTANTE

**Obiettivo**: Verificare scraping completo 20 pagine (~500 torrents)

**Steps**:

1. **Ripristina maxPages = 20**
```bash
ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177
cd /home/ubuntu/stremizio-scraper
nano daily-scraper.js
# Verifica: const maxPages = 20;
```

2. **Esegui scraping completo**
```bash
# Esegui in background (dura ~25-35 minuti)
nohup node daily-scraper.js > daily-full-run.log 2>&1 &

# Monitora progresso
tail -f daily-full-run.log
```

3. **Attendi completamento (~30 minuti)**

4. **Verifica statistiche finali**
```bash
# Cerca nel log
grep "DAILY SCRAPER STATISTICS" -A 10 daily-full-run.log
```

5. **Output atteso**
```
📊 DAILY SCRAPER STATISTICS
⏱️  Total time: 25-35 minutes
📂 Total torrents scraped: 400-500  ✅ NON 2500!
✅ New torrents added: XXX
⏭️  Duplicates skipped: XXX
❌ Errors: < 10
```

6. **Verifica CSV not found**
```bash
ls -lh daily-*.csv
wc -l daily-*.csv
```

7. **Incolla statistiche qui**
```

ubuntu@aio:~/stremizio-scraper$            ls -lh daily-*.csv
wc -l daily-*.csv
-rw-rw-r-- 1 ubuntu ubuntu 8.6K Nov 14 14:14 daily-2025-11-14.csv
-rw-rw-r-- 1 ubuntu ubuntu 7.8K Nov 17 17:30 daily-2025-11-17.csv
   50 daily-2025-11-14.csv
   47 daily-2025-11-17.csv
   97 total


[329/331] Chad Powers - Stagione 1 (2025) [COMPLETA] SD x264 AAC ITA SUB ITA - m...
   Type: series | Seeders: 7 | Size: 1.76 GB
   📥 Downloading .torrent file...
   ⚠️  Could not parse .torrent (will save torrent only)
      🔍 Searching TMDb... (query: "Chad Powers", year: 2025)
      🎬 Found via TMDb: IMDb=tt31449991, TMDb=247168
      🔄 Updating with episodes...
   ✅ Saved! (144 new, 66 duplicates)

[330/331] Nessuno ci ha visti partire - Stagione 1 (2025) [COMPLETA] SD x264 AAC...
   Type: series | Seeders: 5 | Size: 2.19 GB
   📥 Downloading .torrent file...
   ⚠️  Could not parse .torrent (will save torrent only)
      🔍 Searching TMDb... (query: "Nessuno ci ha visti partire", year: 2025)
      🎬 Found via TMDb: IMDb=tt31221478, TMDb=246027
      🔄 Updating with episodes...
   ✅ Saved! (144 new, 66 duplicates)

[331/331] Monster - La Storia di Ed Gein - Stagione 3 (2025) [COMPLETA] SD x264 ...
   Type: series | Seeders: 6 | Size: 3.94 GB
   📥 Downloading .torrent file...
   ⚠️  Could not parse .torrent (will save torrent only)
      🔍 Searching TMDb... (query: "Monster La Storia di Ed Gein", year: 2025)
      🎬 Found TMDb ID: 286801 (no IMDb ID)
      🔄 Auto-completing missing ID...
🔄 Only TMDb present (286801), converting to IMDb...
🔄 Converting TMDb→IMDb: 286801 (tv)
⚠️  No IMDb ID found for TMDb 286801
   ✅ Saved! (144 new, 67 duplicates)

================================================================================
📊 DAILY SCRAPER STATISTICS
================================================================================
⏱️  Total time: 26.37 minutes
📂 Total torrents scraped: 331
✅ New torrents added: 144
⏭️  Duplicates skipped: 67
❌ Errors: 0
================================================================================

📄 Not found titles saved to: daily-2025-11-17.csv
   Total entries: 46

✅ Daily scraper completed!



non sono 500 perche forse ci stavano torrent non film o serie tv giusto???
```

**✅ PASS Criteria**:
- [ ] Processa 400-500 torrents (20 pagine × ~25/pagina)
- [ ] Log mostra `📄 Page 1/20` ... `📄 Page 20/20`
- [ ] Errori < 10
- [ ] CSV generato con torrents senza IDs
- [ ] NO software/musica/libri processati
- [ ] Tempo esecuzione: 25-40 minuti

**🔴 FAIL Actions**:
- Se processa 2500+: versione server non aggiornata
- Se errori > 50: problemi TMDb API o network
- Se trova software/musica: filtro categorie non funziona

---

## 🎯 **PRIORITÀ 2: TEST ADDON API (Film & Serie)**

### Test A1: Film Popolare (DB Hit) ⚡ VELOCITÀ

**Obiettivo**: Verificare performance DB per film già presente

**Film Test**: "Titanic (1997)" - IMDb: tt0120338

**Steps**:

1. **Verifica film nel DB**
```bash
ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177 \
  "sudo -u postgres psql stremizio -c \"SELECT info_hash, title, imdb_id, tmdb_id, cached_rd, seeders FROM torrents WHERE imdb_id = 'tt0120338' LIMIT 5;\""
```

2. **Test API addon via curl**
```bash
# Film: Titanic (1997) - TMDb ID: 597
curl "https://stremizio2-amber.vercel.app/eyJ0bWRiX2tleSI6IjU0NjJmNzg0NjlmM2Q4MGJmNTIwMTY0NTI5NGMxNmU0IiwidXNlX3JkIjp0cnVlLCJyZF9rZXkiOiJCWlRFQ1pHWU1aNlNSSUhFMzJCQzZWRE1GN0NaTVU2VFlSUjVBVFMzRVFMQ01DQVlaSkhBIiwidXNlX2NvcnNhcm9uZXJvIjp0cnVlLCJ1c2VfdWluZGV4IjpmYWxzZSwidXNlX2tuYWJlbiI6ZmFsc2V9/stream/movie/597.json" | jq '.'
```

3. **Monitora log Vercel**
```bash
# In altra finestra terminale
vercel logs --follow
```

4. **Cerca nel log**
```
💾 [DB] Searching by IMDb: tt0120338
💾 [DB] Found XX torrents for IMDb tt0120338
✅ Stream request completed in XXXms
```

5. **Incolla log qui**
```
💾 [DB] Searching by IMDb: tt0120338 (movie)
💾 [DB] Found 1 torrents for IMDb tt0120338
✅ Stream request completed in 2773ms


il log completo...

2025-11-17 22:43:55.758 [info] 🌐 GET /eyJ0bWRiX2tleSI6IjU0NjJmNzg0NjlmM2Q4MGJmNTIwMTY0NTI5NGMxNmU0IiwidXNlX3JkIjp0cnVlLCJyZF9rZXkiOiJCWlRFQ1pHWU1aNlNSSUhFMzJCQzZWRE1GN0NaTVU2VFlSUjVBVFMzRVFMQ01DQVlaSkhBIiwidXNlX2NvcnNhcm9uZXJvIjp0cnVlLCJ1c2VfdWluZGV4IjpmYWxzZSwidXNlX2tuYWJlbiI6ZmFsc2V9/stream/movie/597.json - curl/8.7.1
2025-11-17 22:43:55.761 [info] 🧹 Cache cleanup: kept 0 entries
2025-11-17 22:43:55.761 [info] 🎯 Processing movie with ID: 597
2025-11-17 22:43:55.762 [info] 🔵 Real-Debrid enabled
2025-11-17 22:43:55.762 [info] 🔍 Looking up details for TMDb: 597
2025-11-17 22:43:55.763 [info] 🔄 Fetching TMDb details for movie 597...
2025-11-17 22:43:55.845 [info] ✅ TMDb 597 → Titanic (1997), IMDb: tt0120338
2025-11-17 22:43:55.869 [info] ✅ Found: Titanic (1997)
2025-11-17 22:43:55.876 [info] ✅ PostgreSQL Pool initialized
2025-11-17 22:43:55.876 [info] 💾 [DB] Database connection initialized
2025-11-17 22:43:55.876 [info] 💾 [DB] Searching by IMDb: tt0120338 (movie)
2025-11-17 22:43:56.378 [info] 💾 [DB] Found 1 torrents for IMDb tt0120338
2025-11-17 22:43:56.378 [info] 💾 [DB] Found 1 results in database!
2025-11-17 22:43:56.379 [info] 📚 Final search queries: [ 'Titanic 1997', 'Titanic' ]
2025-11-17 22:43:56.379 [info] 🔍 Searching all sources for: "Titanic 1997"
2025-11-17 22:43:56.379 [info] ⏭️  UIndex disabled by user
2025-11-17 22:43:56.379 [info] 🏴‍☠️ CorsaroNero enabled for search
2025-11-17 22:43:56.379 [info] 🧹 Cleaning query: "Titanic 1997"
2025-11-17 22:43:56.380 [info] ✨ Cleaned query: "Titanic 1997"
2025-11-17 22:43:56.381 [info] 🏴‍☠️ [Strategy: Original cleaned] Searching CorsaroNero for: "Titanic 1997"
2025-11-17 22:43:56.381 [info] 🏴‍☠️ [Single Query] Searching Il Corsaro Nero for: "Titanic 1997" (type: movie)
2025-11-17 22:43:56.383 [info] ⏭️  Knaben disabled by user
2025-11-17 22:43:56.799 [info] 🏴‍☠️ Found 5 potential results on CorsaroNero. Filtering by category...
2025-11-17 22:43:56.802 [info] 🏴‍☠️ After category filter: 5 results (from 5 total)
2025-11-17 22:43:56.802 [info] 🏴‍☠️ Fetching details for top 5 results...
2025-11-17 22:43:56.802 [info] 🏴‍☠️   - Processing row: "[1997] Titanic - Q2 EXTENDED EDITION [1080p x264 ITA THD 7.1 ATMOS 9.1.6 Sub Ita] by phadron MIRCrew"
2025-11-17 22:43:56.805 [info] 🏴‍☠️   - Processing row: "Titanic (1997) AC3 5.1 ITA.ENG 2160p H265 HDR10 Dolby Vision sub ita.eng Sp33dy94 MIRCrew"
2025-11-17 22:43:56.810 [info] 🏴‍☠️   - Processing row: "Titanic (1997).720p.h264.ita.eng.sub.ita.eng-MIRCrew.mkv"
2025-11-17 22:43:56.811 [info] 🏴‍☠️   - Processing row: "Titanic.1997.iTA.ENG.AC3.1080p.Bluray.HEVC.10bit-ODS"
2025-11-17 22:43:56.816 [info] 🏴‍☠️   - Processing row: "Titanic (1997) AC3 5.1 ITA.ENG 1080p H265 sub ita.eng Sp33dy94 MIRCrew"
2025-11-17 22:43:57.257 [info] 🏴‍☠️ Successfully parsed 5 streams from CorsaroNero.
2025-11-17 22:43:57.257 [info] 🏴‍☠️ Multi-strategy search for CorsaroNero found 5 total unique results.
2025-11-17 22:43:57.258 [info] ✅ CorsaroNero returned 5 results for query.
2025-11-17 22:43:57.508 [info] 🔍 Searching all sources for: "Titanic"
2025-11-17 22:43:57.508 [info] ⏭️  UIndex disabled by user
2025-11-17 22:43:57.508 [info] 🏴‍☠️ CorsaroNero enabled for search
2025-11-17 22:43:57.508 [info] 🧹 Cleaning query: "Titanic"
2025-11-17 22:43:57.509 [info] ✨ Cleaned query: "Titanic"
2025-11-17 22:43:57.509 [info] 🏴‍☠️ [Strategy: Original cleaned] Searching CorsaroNero for: "Titanic"
2025-11-17 22:43:57.509 [info] 🏴‍☠️ [Single Query] Searching Il Corsaro Nero for: "Titanic" (type: movie)
2025-11-17 22:43:57.511 [info] ⏭️  Knaben disabled by user
2025-11-17 22:43:57.778 [info] 🏴‍☠️ Found 25 potential results on CorsaroNero. Filtering by category...
2025-11-17 22:43:57.778 [info] 🏴‍☠️   - Skipping category: "giochi - pc"
2025-11-17 22:43:57.779 [info] 🏴‍☠️   - Skipping category: "altro - documentari"
2025-11-17 22:43:57.779 [info] 🏴‍☠️   - Skipping category: "libri - edicola"
2025-11-17 22:43:57.780 [info] 🏴‍☠️   - Skipping category: "musica - audio"
2025-11-17 22:43:57.780 [info] 🏴‍☠️   - Skipping category: "libri - audiolibri"
2025-11-17 22:43:57.780 [info] 🏴‍☠️   - Skipping category: "musica - audio"
2025-11-17 22:43:57.781 [info] 🏴‍☠️   - Skipping category: "serie tv"
2025-11-17 22:43:57.781 [info] 🏴‍☠️ After category filter: 18 results (from 25 total)
2025-11-17 22:43:57.785 [info] 🏴‍☠️ Fetching details for top 6 results...
2025-11-17 22:43:57.785 [info] 🏴‍☠️   - Processing row: "[1997] Titanic - Q2 EXTENDED EDITION [1080p x264 ITA THD 7.1 ATMOS 9.1.6 Sub Ita] by phadron MIRCrew"
2025-11-17 22:43:57.787 [info] 🏴‍☠️   - Processing row: "La furia dei titani - Wrath of the Titans (2012) 2160p H265 BluRay Rip 10 bit DV HDR10+ ita eng AC3 5.1 sub ita eng NUita NUeng Licdom"
2025-11-17 22:43:57.787 [info] 🏴‍☠️ [Short Query] Parola mancante: "titanic" non trovata in "La furia dei titani - Wrath of the Titans (2012) 2160p H265 BluRay Rip 10 bit DV HDR10+ ita eng AC3 5.1 sub ita eng NUita NUeng Licdom"
2025-11-17 22:43:57.787 [info] 🏴‍☠️   - Processing row: "La furia dei titani - Wrath of the Titans (2012) 1080p H265 BluRay Rip ita eng AC3 5.1 sub ita eng NUita NUeng Licdom"
2025-11-17 22:43:57.787 [info] 🏴‍☠️ [Short Query] Parola mancante: "titanic" non trovata in "La furia dei titani - Wrath of the Titans (2012) 1080p H265 BluRay Rip ita eng AC3 5.1 sub ita eng NUita NUeng Licdom"
2025-11-17 22:43:57.787 [info] 🏴‍☠️   - Processing row: "Scontro tra titani - Clash of the Titans (2010) 2160p H265 BluRay Rip 10 bit DV HDR10+ ita eng AC3 5.1 sub ita eng NUita NUeng Licdom"
2025-11-17 22:43:57.787 [info] 🏴‍☠️ [Short Query] Parola mancante: "titanic" non trovata in "Scontro tra titani - Clash of the Titans (2010) 2160p H265 BluRay Rip 10 bit DV HDR10+ ita eng AC3 5.1 sub ita eng NUita NUeng Licdom"
2025-11-17 22:43:57.788 [info] 🏴‍☠️   - Processing row: "Scontro tra titani - Clash of the Titans (2010) 1080p H265 BluRay Rip ita eng AC3 5.1 sub ita eng NUita NUeng Licdom"
2025-11-17 22:43:57.788 [info] 🏴‍☠️ [Short Query] Parola mancante: "titanic" non trovata in "Scontro tra titani - Clash of the Titans (2010) 1080p H265 BluRay Rip ita eng AC3 5.1 sub ita eng NUita NUeng Licdom"
2025-11-17 22:43:57.788 [info] 🏴‍☠️   - Processing row: "La Furia dei Titani (2012) 1080P H265 EAC3 5.1 MULTILANG MULTISUB [Webdl By_Blasco_77]"
2025-11-17 22:43:57.788 [info] 🏴‍☠️ [Short Query] Parola mancante: "titanic" non trovata in "La Furia dei Titani (2012) 1080P H265 EAC3 5.1 MULTILANG MULTISUB [Webdl By_Blasco_77]"
2025-11-17 22:43:58.040 [info] 🏴‍☠️ Successfully parsed 1 streams from CorsaroNero.
2025-11-17 22:43:58.040 [info] 🏴‍☠️ Multi-strategy search for CorsaroNero found 1 total unique results.
2025-11-17 22:43:58.040 [info] ✅ CorsaroNero returned 1 results for query.
2025-11-17 22:43:58.040 [info] 🔎 Found a total of 6 raw results from all sources. Performing smart deduplication...
2025-11-17 22:43:58.040 [info] 💾 [DB] Adding 1 database results to aggregation...
2025-11-17 22:43:58.040 [info] 💾 [DB] Total raw results after DB merge: 7
2025-11-17 22:43:58.040 [info] ✅ [Dedup] NEW hash: E1571888... -> [1997] Titanic - Q2 EXTENDED EDITION [1080p x264 ITA THD 7.1 ATMOS 9.1.6 Sub Ita] by phadron MIRCrew
2025-11-17 22:43:58.040 [info] ✅ [Dedup] NEW hash: 0A18B72E... -> Titanic (1997) AC3 5.1 ITA.ENG 2160p H265 HDR10 Dolby Vision sub ita.eng Sp33dy94 MIRCrew
2025-11-17 22:43:58.040 [info] ✅ [Dedup] NEW hash: 9E34FD43... -> Titanic (1997).720p.h264.ita.eng.sub.ita.eng-MIRCrew.mkv
2025-11-17 22:43:58.040 [info] ✅ [Dedup] NEW hash: F3DE1EC4... -> Titanic.1997.iTA.ENG.AC3.1080p.Bluray.HEVC.10bit-ODS
2025-11-17 22:43:58.040 [info] ✅ [Dedup] NEW hash: 31FF8133... -> Titanic (1997) AC3 5.1 ITA.ENG 1080p H265 sub ita.eng Sp33dy94 MIRCrew
2025-11-17 22:43:58.040 [info] ⏭️  [Dedup] SKIP hash E1571888...: "[1997] Titanic - Q2 EXTENDED EDITION [1080p x264 ITA THD 7.1 ATMOS 9.1.6 Sub Ita] by phadron MIRCrew" (keeping "[1997] Titanic - Q2 EXTENDED EDITION [1080p x264 ITA THD 7.1 ATMOS 9.1.6 Sub Ita] by phadron MIRCrew")
2025-11-17 22:43:58.040 [info] ⏭️  [Dedup] SKIP hash E1571888...: "[1997] Titanic - Q2 EXTENDED EDITION [1080p x264 ITA THD 7.1 ATMOS 9.1.6 Sub Ita] by phadron MIRCrew" (keeping "[1997] Titanic - Q2 EXTENDED EDITION [1080p x264 ITA THD 7.1 ATMOS 9.1.6 Sub Ita] by phadron MIRCrew")
2025-11-17 22:43:58.040 [info] ✨ After smart deduplication, we have 5 unique, high-quality results.
2025-11-17 22:43:58.041 [info] 📡 Found 5 total torrents from all sources after fallbacks
2025-11-17 22:43:58.054 [info] ✅ Year match for "1997 Titanic - Q2 EXTENDED EDITION 1080p x264 ITA THD 71 ATMOS 916 Sub Ita by phadron MIRCrew" (1997)
2025-11-17 22:43:58.054 [info] ✅ Year match for "Titanic AC3 51 ITAENG 2160p H265 HDR10 Dolby Vision sub itaeng Sp33dy94 MIRCrew" (1997)
2025-11-17 22:43:58.054 [info] ✅ Year match for "Titanic 720ph264itaengsubitaeng-MIRCrewmkv" (1997)
2025-11-17 22:43:58.054 [info] ✅ Year match for "Titanic1997iTAENGAC31080pBlurayHEVC10bit-ODS" (1997)
2025-11-17 22:43:58.054 [info] ✅ Year match for "Titanic AC3 51 ITAENG 1080p H265 sub itaeng Sp33dy94 MIRCrew" (1997)
2025-11-17 22:43:58.054 [info] 🎬 Movie filtering: 5 of 5 results match
2025-11-17 22:43:58.054 [info] 🔄 Checking debrid services for 5 results...
2025-11-17 22:43:58.054 [info] 🔵 Checking Real-Debrid cache...
2025-11-17 22:43:58.162 [info] 💾 [DB] Found 0/5 hashes with valid RD cache (< 5 days)
2025-11-17 22:43:58.162 [info] 💾 [DB Cache] 0/5 hashes found in cache (< 5 days)
2025-11-17 22:43:58.528 [info] ✅ Cache check complete. RD: 100 torrents, Torbox: 0 torrents, AllDebrid: 0 hashes
2025-11-17 22:43:58.530 [info] 🎉 Successfully processed 5 streams in 2768ms
2025-11-17 22:43:58.530 [info] ⚡ 0 cached streams available for instant playback
2025-11-17 22:43:58.530 [info] 🔍 [Background Check] dbEnabled=true, mediaDetails=true, tmdbId=597, imdbId=tt0120338, kitsuId=undefined
2025-11-17 22:43:58.530 [info] 🚀 [Background] Saving 5 CorsaroNero results to DB
2025-11-17 22:43:58.530 [info] ✅ Stream request completed in 2773ms
2025-11-17 22:43:58.545 [info] 💾 [DB Save] Saving 5 CorsaroNero results...
2025-11-17 22:43:58.545 [info] 📏 [DB Save] Title "Titanic" - Short: false
2025-11-17 22:43:58.546 [info] ✅ [DB Save] Title match: "[1997] Titanic - Q2 EXTENDED EDITION [1080p x264 ITA THD 7.1 ATMOS 9.1.6 Sub Ita] by phadron MIRCrew" (100% match with "Titanic")
2025-11-17 22:43:58.546 [info] 💾 [DB Save] Processing: [1997] Titanic - Q2 EXTENDED EDITION [1080p x264 ITA THD 7.1 ATMOS 9.1.6 Sub Ita] by phadron MIRCrew - Size: 8.61 GiB (9244917105 bytes), Seeders: 4
2025-11-17 22:43:58.546 [info] ✅ [DB Save] Title match: "Titanic (1997) AC3 5.1 ITA.ENG 2160p H265 HDR10 Dolby Vision sub ita.eng Sp33dy94 MIRCrew" (100% match with "Titanic")
2025-11-17 22:43:58.546 [info] 💾 [DB Save] Processing: Titanic (1997) AC3 5.1 ITA.ENG 2160p H265 HDR10 Dolby Vision sub ita.eng Sp33dy94 MIRCrew - Size: 5.93 GiB (6367289016 bytes), Seeders: 23
2025-11-17 22:43:58.546 [info] ✅ [DB Save] Title match: "Titanic (1997).720p.h264.ita.eng.sub.ita.eng-MIRCrew.mkv" (100% match with "Titanic")
2025-11-17 22:43:58.546 [info] 💾 [DB Save] Processing: Titanic (1997).720p.h264.ita.eng.sub.ita.eng-MIRCrew.mkv - Size: 3.81 GiB (4090956349 bytes), Seeders: 3
2025-11-17 22:43:58.547 [info] ✅ [DB Save] Title match: "Titanic.1997.iTA.ENG.AC3.1080p.Bluray.HEVC.10bit-ODS" (100% match with "Titanic")
2025-11-17 22:43:58.547 [info] 💾 [DB Save] Processing: Titanic.1997.iTA.ENG.AC3.1080p.Bluray.HEVC.10bit-ODS - Size: 17.13 GiB (18393197445 bytes), Seeders: 1
2025-11-17 22:43:58.547 [info] ✅ [DB Save] Title match: "Titanic (1997) AC3 5.1 ITA.ENG 1080p H265 sub ita.eng Sp33dy94 MIRCrew" (100% match with "Titanic")
2025-11-17 22:43:58.547 [info] 💾 [DB Save] Processing: Titanic (1997) AC3 5.1 ITA.ENG 1080p H265 sub ita.eng Sp33dy94 MIRCrew - Size: 4.77 GiB (5121748500 bytes), Seeders: 9
```

**✅ PASS Criteria**:
- [ ] Risposta < 300ms
- [ ] Log mostra "Found XX torrents"
- [ ] NO chiamata CorsaroNero (DB hit)
- [ ] NO chiamata FTS (DB ID hit)
- [ ] Streams disponibili in Stremio

---

### Test A2: Film Raro (Enrichment) 🆕 NUOVO

**Obiettivo**: Verificare che film NON in DB viene aggiunto con IDs

**Film Test**: Scegli un film NUOVO oltre pagina 100 CorsaroNero

**Steps**:

1. **Trova film raro su CorsaroNero manualmente**
```bash
# Apri browser e vai su:
# https://ilcorsaronero.link/cat/film?page=50
# Scegli un film recente/oscuro
# Copia titolo esatto: [TITOLO]
```

2. **Verifica NON in DB**
```bash
ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177 \
  "sudo -u postgres psql stremizio -c \"SELECT COUNT(*) FROM torrents WHERE title ILIKE '%maledizione del coniglio mannaro%';\""
# Expected: count = 0
```

3. **Test API addon via curl**
```bash
# Sostituisci XXX con TMDb ID del film
curl "https://stremizio2-amber.vercel.app/eyJ0bWRiX2tleSI6IjU0NjJmNzg0NjlmM2Q4MGJmNTIwMTY0NTI5NGMxNmU0IiwidXNlX3JkIjp0cnVlLCJyZF9rZXkiOiJCWlRFQ1pHWU1aNlNSSUhFMzJCQzZWRE1GN0NaTVU2VFlSUjVBVFMzRVFMQ01DQVlaSkhBIiwidXNlX2NvcnNhcm9uZXJvIjp0cnVlLCJ1c2VfdWluZGV4IjpmYWxzZSwidXNlX2tuYWJlbiI6ZmFsc2V9/stream/movie/tt0312004.json" | jq '.streams[0].title'
```

4. **Monitora log Vercel**
```bash
vercel logs --follow
```

**Cerca nel log**:
```
💾 [DB] Searching by IMDb: ttXXXXXXX
💾 [DB] Found 0 torrents
🔍 Searching all sources...
🏴‍☠️ [CorsaroNero] Found X results
🚀 [Background] Saving X CorsaroNero results to DB
💾 [DB Save] Processing: [TITOLO]
✅ [Background] Saved X torrents to database
```

5. **Verifica DB dopo**
```bash
ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177 \
  "sudo -u postgres psql stremizio -c \"SELECT info_hash, title, imdb_id, tmdb_id FROM torrents WHERE title ILIKE '%TITOLO%';\""
# Expected: 1+ rows with IDs
```

6. **Incolla risultati**
```
2025-11-17 22:50:28.250 [info] 🌐 GET /eyJ0bWRiX2tleSI6IjU0NjJmNzg0NjlmM2Q4MGJmNTIwMTY0NTI5NGMxNmU0IiwidXNlX3JkIjp0cnVlLCJyZF9rZXkiOiJCWlRFQ1pHWU1aNlNSSUhFMzJCQzZWRE1GN0NaTVU2VFlSUjVBVFMzRVFMQ01DQVlaSkhBIiwidXNlX2NvcnNhcm9uZXJvIjp0cnVlLCJ1c2VfdWluZGV4IjpmYWxzZSwidXNlX2tuYWJlbiI6ZmFsc2V9/stream/movie/tt0312004.json - curl/8.7.1
2025-11-17 22:50:28.254 [info] 🧹 Cache cleanup: kept 0 entries
2025-11-17 22:50:28.254 [info] 🎯 Processing movie with ID: tt0312004
2025-11-17 22:50:28.254 [info] 🔵 Real-Debrid enabled
2025-11-17 22:50:28.254 [info] 🔍 Looking up TMDB details for IMDb: tt0312004
2025-11-17 22:50:28.601 [info] 🇮🇹 Found Italian title: "Wallace & Gromit - La maledizione del coniglio mannaro"
2025-11-17 22:50:28.601 [info] ✅ Found: Wallace & Gromit: The Curse of the Were-Rabbit (2005)
2025-11-17 22:50:28.602 [info] ✅ PostgreSQL Pool initialized
2025-11-17 22:50:28.602 [info] 💾 [DB] Database connection initialized
2025-11-17 22:50:28.602 [info] 💾 [DB] Searching by IMDb: tt0312004 (movie)
2025-11-17 22:50:29.139 [info] 💾 [DB] Found 0 torrents for IMDb tt0312004
2025-11-17 22:50:29.139 [info] 💾 [DB] No results by IMDb, trying TMDb ID: 533
2025-11-17 22:50:29.139 [info] 💾 [DB] Searching by TMDb: 533 (movie)
2025-11-17 22:50:29.245 [info] 💾 [DB] Found 0 torrents for TMDb 533
2025-11-17 22:50:29.245 [info] 💾 [DB] No results by ID. Trying Full-Text Search (FTS)...
2025-11-17 22:50:29.248 [info] 💾 [DB FTS] Cleaned title: "Wallace & Gromit: The Curse of the Were Rabbit"
2025-11-17 22:50:29.248 [info] 💾 [DB FTS] Searching: "Wallace & Gromit: The Curse of the Were Rabbit" (movie) year=2005
2025-11-17 22:50:29.375 [info] 💾 [DB FTS] Found 0 torrents (rank threshold applied)
2025-11-17 22:50:29.375 [info] 💾 [DB FTS] No results found. Will search online sources...
2025-11-17 22:50:29.375 [info] 🇮🇹 Adding Italian title "Wallace & Gromit - La maledizione del coniglio mannaro" to search queries.
2025-11-17 22:50:29.375 [info] 📚 Final search queries: [
  'Wallace & Gromit: The Curse of the Were-Rabbit 2005',
  'Wallace & Gromit: The Curse of the Were-Rabbit',
  'Wallace & Gromit - La maledizione del coniglio mannaro 2005',
  'Wallace & Gromit - La maledizione del coniglio mannaro'
]
2025-11-17 22:50:29.375 [info] 🔍 Searching all sources for: "Wallace & Gromit: The Curse of the Were-Rabbit 2005"
2025-11-17 22:50:29.375 [info] ⏭️  UIndex disabled by user
2025-11-17 22:50:29.375 [info] 🏴‍☠️ CorsaroNero enabled for search
2025-11-17 22:50:29.376 [info] 🧹 Cleaning query: "Wallace & Gromit: The Curse of the Were-Rabbit 2005"
2025-11-17 22:50:29.377 [info] ✨ Cleaned query: "Wallace Gromit The Curse of the Were-Rabbit 2005"
2025-11-17 22:50:29.377 [info] 🏴‍☠️ [Strategy: Original cleaned] Searching CorsaroNero for: "Wallace Gromit The Curse of the Were-Rabbit 2005"
2025-11-17 22:50:29.378 [info] 🏴‍☠️ [Single Query] Searching Il Corsaro Nero for: "Wallace Gromit The Curse of the Were-Rabbit 2005" (type: movie)
2025-11-17 22:50:29.380 [info] ⏭️  Knaben disabled by user
2025-11-17 22:50:29.736 [info] 🏴‍☠️ Found 2 potential results on CorsaroNero. Filtering by category...
2025-11-17 22:50:29.738 [info] 🏴‍☠️ After category filter: 2 results (from 2 total)
2025-11-17 22:50:29.738 [info] 🏴‍☠️ Fetching details for top 2 results...
2025-11-17 22:50:29.738 [info] 🏴‍☠️   - Processing row: "Wallace & Gromit - La maledizione del coniglio mannaro - The Curse of the Were-Rabbit (2005) UpScaled 2160p H265 BluRay Rip 10 bit HDR ita eng AC3 5.1 sub ita eng NUeng Licdom"
2025-11-17 22:50:29.741 [info] 🏴‍☠️   - Processing row: "Wallace & Gromit - La maledizione del coniglio mannaro - The Curse of the Were-Rabbit (2005) 1080p H265 BluRay Rip ita eng AC3 5.1 sub ita eng NUeng Licdom"
2025-11-17 22:50:30.033 [info] 🏴‍☠️ Successfully parsed 2 streams from CorsaroNero.
2025-11-17 22:50:30.034 [info] 🏴‍☠️ Multi-strategy search for CorsaroNero found 2 total unique results.
2025-11-17 22:50:30.034 [info] ✅ CorsaroNero returned 2 results for query.
2025-11-17 22:50:30.286 [info] 🔍 Searching all sources for: "Wallace & Gromit: The Curse of the Were-Rabbit"
2025-11-17 22:50:30.286 [info] ⏭️  UIndex disabled by user
2025-11-17 22:50:30.286 [info] 🏴‍☠️ CorsaroNero enabled for search
2025-11-17 22:50:30.286 [info] 🧹 Cleaning query: "Wallace & Gromit: The Curse of the Were-Rabbit"
2025-11-17 22:50:30.286 [info] ✨ Cleaned query: "Wallace Gromit The Curse of the Were-Rabbit"
2025-11-17 22:50:30.286 [info] 🏴‍☠️ [Strategy: Original cleaned] Searching CorsaroNero for: "Wallace Gromit The Curse of the Were-Rabbit"
2025-11-17 22:50:30.286 [info] 🏴‍☠️ [Single Query] Searching Il Corsaro Nero for: "Wallace Gromit The Curse of the Were-Rabbit" (type: movie)
2025-11-17 22:50:30.287 [info] ⏭️  Knaben disabled by user
2025-11-17 22:50:30.566 [info] 🏴‍☠️ Found 2 potential results on CorsaroNero. Filtering by category...
2025-11-17 22:50:30.566 [info] 🏴‍☠️ After category filter: 2 results (from 2 total)
2025-11-17 22:50:30.566 [info] 🏴‍☠️ Fetching details for top 2 results...
2025-11-17 22:50:30.566 [info] 🏴‍☠️   - Processing row: "Wallace & Gromit - La maledizione del coniglio mannaro - The Curse of the Were-Rabbit (2005) UpScaled 2160p H265 BluRay Rip 10 bit HDR ita eng AC3 5.1 sub ita eng NUeng Licdom"
2025-11-17 22:50:30.570 [info] 🏴‍☠️   - Processing row: "Wallace & Gromit - La maledizione del coniglio mannaro - The Curse of the Were-Rabbit (2005) 1080p H265 BluRay Rip ita eng AC3 5.1 sub ita eng NUeng Licdom"
2025-11-17 22:50:30.819 [info] 🏴‍☠️ Successfully parsed 2 streams from CorsaroNero.
2025-11-17 22:50:30.819 [info] 🏴‍☠️ Multi-strategy search for CorsaroNero found 2 total unique results.
2025-11-17 22:50:30.819 [info] ✅ CorsaroNero returned 2 results for query.
2025-11-17 22:50:31.070 [info] 🔍 Searching all sources for: "Wallace & Gromit - La maledizione del coniglio mannaro 2005"
2025-11-17 22:50:31.070 [info] ⏭️  UIndex disabled by user
2025-11-17 22:50:31.071 [info] 🏴‍☠️ CorsaroNero enabled for search
2025-11-17 22:50:31.071 [info] 🧹 Cleaning query: "Wallace & Gromit - La maledizione del coniglio mannaro 2005"
2025-11-17 22:50:31.071 [info] ✨ Cleaned query: "Wallace Gromit - La maledizione del coniglio mannaro 2005"
2025-11-17 22:50:31.071 [info] 🏴‍☠️ [Strategy: Original cleaned] Searching CorsaroNero for: "Wallace Gromit - La maledizione del coniglio mannaro 2005"
2025-11-17 22:50:31.071 [info] 🏴‍☠️ [Single Query] Searching Il Corsaro Nero for: "Wallace Gromit - La maledizione del coniglio mannaro 2005" (type: movie)
2025-11-17 22:50:31.073 [info] ⏭️  Knaben disabled by user
2025-11-17 22:50:31.342 [info] 🏴‍☠️ Found 3 potential results on CorsaroNero. Filtering by category...
2025-11-17 22:50:31.342 [info] 🏴‍☠️ After category filter: 3 results (from 3 total)
2025-11-17 22:50:31.342 [info] 🏴‍☠️ Fetching details for top 3 results...
2025-11-17 22:50:31.343 [info] 🏴‍☠️   - Processing row: "Wallace & Gromit - La maledizione del coniglio mannaro - The Curse of the Were-Rabbit (2005) UpScaled 2160p H265 BluRay Rip 10 bit HDR ita eng AC3 5.1 sub ita eng NUeng Licdom"
2025-11-17 22:50:31.343 [info] 🏴‍☠️   - Processing row: "Wallace & Gromit - La maledizione del coniglio mannaro - The Curse of the Were-Rabbit (2005) 1080p H265 BluRay Rip ita eng AC3 5.1 sub ita eng NUeng Licdom"
2025-11-17 22:50:31.343 [info] 🏴‍☠️   - Processing row: "Wallace & Gromit - La maledizione del coniglio mannaro 2005 x264 576p mkv ita"
2025-11-17 22:50:31.691 [info] 🏴‍☠️ Successfully parsed 3 streams from CorsaroNero.
2025-11-17 22:50:31.691 [info] 🏴‍☠️ Multi-strategy search for CorsaroNero found 3 total unique results.
2025-11-17 22:50:31.691 [info] ✅ CorsaroNero returned 3 results for query.
2025-11-17 22:50:31.940 [info] 🔍 Searching all sources for: "Wallace & Gromit - La maledizione del coniglio mannaro"
2025-11-17 22:50:31.940 [info] ⏭️  UIndex disabled by user
2025-11-17 22:50:31.940 [info] 🏴‍☠️ CorsaroNero enabled for search
2025-11-17 22:50:31.940 [info] 🧹 Cleaning query: "Wallace & Gromit - La maledizione del coniglio mannaro"
2025-11-17 22:50:31.941 [info] ✨ Cleaned query: "Wallace Gromit - La maledizione del coniglio mannaro"
2025-11-17 22:50:31.941 [info] 🏴‍☠️ [Strategy: Original cleaned] Searching CorsaroNero for: "Wallace Gromit - La maledizione del coniglio mannaro"
2025-11-17 22:50:31.941 [info] 🏴‍☠️ [Single Query] Searching Il Corsaro Nero for: "Wallace Gromit - La maledizione del coniglio mannaro" (type: movie)
2025-11-17 22:50:31.941 [info] ⏭️  Knaben disabled by user
2025-11-17 22:50:32.190 [info] 🏴‍☠️ Found 3 potential results on CorsaroNero. Filtering by category...
2025-11-17 22:50:32.190 [info] 🏴‍☠️ After category filter: 3 results (from 3 total)
2025-11-17 22:50:32.190 [info] 🏴‍☠️ Fetching details for top 3 results...
2025-11-17 22:50:32.190 [info] 🏴‍☠️   - Processing row: "Wallace & Gromit - La maledizione del coniglio mannaro - The Curse of the Were-Rabbit (2005) UpScaled 2160p H265 BluRay Rip 10 bit HDR ita eng AC3 5.1 sub ita eng NUeng Licdom"
2025-11-17 22:50:32.190 [info] 🏴‍☠️   - Processing row: "Wallace & Gromit - La maledizione del coniglio mannaro - The Curse of the Were-Rabbit (2005) 1080p H265 BluRay Rip ita eng AC3 5.1 sub ita eng NUeng Licdom"
2025-11-17 22:50:32.190 [info] 🏴‍☠️   - Processing row: "Wallace & Gromit - La maledizione del coniglio mannaro 2005 x264 576p mkv ita"
2025-11-17 22:50:32.456 [info] 🏴‍☠️ Successfully parsed 3 streams from CorsaroNero.
2025-11-17 22:50:32.456 [info] 🏴‍☠️ Multi-strategy search for CorsaroNero found 3 total unique results.
2025-11-17 22:50:32.456 [info] ✅ CorsaroNero returned 3 results for query.
2025-11-17 22:50:32.456 [info] 🔎 Found a total of 10 raw results from all sources. Performing smart deduplication...
2025-11-17 22:50:32.457 [info] ✅ [Dedup] NEW hash: BCA50B7D... -> Wallace & Gromit - La maledizione del coniglio mannaro - The Curse of the Were-Rabbit (2005) UpScaled 2160p H265 BluRay Rip 10 bit HDR ita eng AC3 5.1 sub ita eng NUeng Licdom
2025-11-17 22:50:32.457 [info] ✅ [Dedup] NEW hash: 8ACA6041... -> Wallace & Gromit - La maledizione del coniglio mannaro - The Curse of the Were-Rabbit (2005) 1080p H265 BluRay Rip ita eng AC3 5.1 sub ita eng NUeng Licdom
2025-11-17 22:50:32.457 [info] ⏭️  [Dedup] SKIP hash BCA50B7D...: "Wallace & Gromit - La maledizione del coniglio mannaro - The Curse of the Were-Rabbit (2005) UpScaled 2160p H265 BluRay Rip 10 bit HDR ita eng AC3 5.1 sub ita eng NUeng Licdom" (keeping "Wallace & Gromit - La maledizione del coniglio mannaro - The Curse of the Were-Rabbit (2005) UpScaled 2160p H265 BluRay Rip 10 bit HDR ita eng AC3 5.1 sub ita eng NUeng Licdom")
2025-11-17 22:50:32.457 [info] ⏭️  [Dedup] SKIP hash 8ACA6041...: "Wallace & Gromit - La maledizione del coniglio mannaro - The Curse of the Were-Rabbit (2005) 1080p H265 BluRay Rip ita eng AC3 5.1 sub ita eng NUeng Licdom" (keeping "Wallace & Gromit - La maledizione del coniglio mannaro - The Curse of the Were-Rabbit (2005) 1080p H265 BluRay Rip ita eng AC3 5.1 sub ita eng NUeng Licdom")
2025-11-17 22:50:32.457 [info] ⏭️  [Dedup] SKIP hash BCA50B7D...: "Wallace & Gromit - La maledizione del coniglio mannaro - The Curse of the Were-Rabbit (2005) UpScaled 2160p H265 BluRay Rip 10 bit HDR ita eng AC3 5.1 sub ita eng NUeng Licdom" (keeping "Wallace & Gromit - La maledizione del coniglio mannaro - The Curse of the Were-Rabbit (2005) UpScaled 2160p H265 BluRay Rip 10 bit HDR ita eng AC3 5.1 sub ita eng NUeng Licdom")
2025-11-17 22:50:32.458 [info] ⏭️  [Dedup] SKIP hash 8ACA6041...: "Wallace & Gromit - La maledizione del coniglio mannaro - The Curse of the Were-Rabbit (2005) 1080p H265 BluRay Rip ita eng AC3 5.1 sub ita eng NUeng Licdom" (keeping "Wallace & Gromit - La maledizione del coniglio mannaro - The Curse of the Were-Rabbit (2005) 1080p H265 BluRay Rip ita eng AC3 5.1 sub ita eng NUeng Licdom")
2025-11-17 22:50:32.458 [info] ✅ [Dedup] NEW hash: 62D0F40A... -> Wallace & Gromit - La maledizione del coniglio mannaro 2005 x264 576p mkv ita
2025-11-17 22:50:32.458 [info] ⏭️  [Dedup] SKIP hash BCA50B7D...: "Wallace & Gromit - La maledizione del coniglio mannaro - The Curse of the Were-Rabbit (2005) UpScaled 2160p H265 BluRay Rip 10 bit HDR ita eng AC3 5.1 sub ita eng NUeng Licdom" (keeping "Wallace & Gromit - La maledizione del coniglio mannaro - The Curse of the Were-Rabbit (2005) UpScaled 2160p H265 BluRay Rip 10 bit HDR ita eng AC3 5.1 sub ita eng NUeng Licdom")
2025-11-17 22:50:32.458 [info] ⏭️  [Dedup] SKIP hash 8ACA6041...: "Wallace & Gromit - La maledizione del coniglio mannaro - The Curse of the Were-Rabbit (2005) 1080p H265 BluRay Rip ita eng AC3 5.1 sub ita eng NUeng Licdom" (keeping "Wallace & Gromit - La maledizione del coniglio mannaro - The Curse of the Were-Rabbit (2005) 1080p H265 BluRay Rip ita eng AC3 5.1 sub ita eng NUeng Licdom")
2025-11-17 22:50:32.458 [info] ⏭️  [Dedup] SKIP hash 62D0F40A...: "Wallace & Gromit - La maledizione del coniglio mannaro 2005 x264 576p mkv ita" (keeping "Wallace & Gromit - La maledizione del coniglio mannaro 2005 x264 576p mkv ita")
2025-11-17 22:50:32.458 [info] ✨ After smart deduplication, we have 3 unique, high-quality results.
2025-11-17 22:50:32.458 [info] 📡 Found 3 total torrents from all sources after fallbacks
2025-11-17 22:50:32.474 [info] ✅ Year match for "Wallace & Gromit - La maledizione del coniglio mannaro - The Curse of the Were-Rabbit UpScaled 2160p H265 BluRay Rip 10 bit HDR ita eng AC3 51 sub ita eng NUeng Licdom" (2005)
2025-11-17 22:50:32.474 [info] ✅ Year match for "Wallace & Gromit - La maledizione del coniglio mannaro - The Curse of the Were-Rabbit 1080p H265 BluRay Rip ita eng AC3 51 sub ita eng NUeng Licdom" (2005)
2025-11-17 22:50:32.474 [info] ❌ Movie match failed for "Wallace & Gromit - La maledizione del coniglio mannaro 2005 x264 576p mkv ita" - 0.40 match
2025-11-17 22:50:32.474 [info] ✅ Year match for "Wallace & Gromit - La maledizione del coniglio mannaro 2005 x264 576p mkv ita" (2005)
2025-11-17 22:50:32.474 [info] 🎬 Movie filtering: 3 of 3 results match
2025-11-17 22:50:32.474 [info] 🔄 Checking debrid services for 3 results...
2025-11-17 22:50:32.474 [info] 🔵 Checking Real-Debrid cache...
2025-11-17 22:50:32.578 [info] 💾 [DB] Found 0/3 hashes with valid RD cache (< 5 days)
2025-11-17 22:50:32.578 [info] 💾 [DB Cache] 0/3 hashes found in cache (< 5 days)
2025-11-17 22:50:32.944 [info] ✅ Cache check complete. RD: 100 torrents, Torbox: 0 torrents, AllDebrid: 0 hashes
2025-11-17 22:50:32.945 [info] 🎉 Successfully processed 3 streams in 4691ms
2025-11-17 22:50:32.945 [info] ⚡ 0 cached streams available for instant playback
2025-11-17 22:50:32.945 [info] 🔍 [Background Check] dbEnabled=true, mediaDetails=true, tmdbId=533, imdbId=tt0312004, kitsuId=undefined
2025-11-17 22:50:32.945 [info] 🚀 [Background] Saving 3 CorsaroNero results to DB
2025-11-17 22:50:32.945 [info] ✅ Stream request completed in 4696ms
2025-11-17 22:50:32.961 [info] 💾 [DB Save] Saving 3 CorsaroNero results...
2025-11-17 22:50:32.961 [info] 📏 [DB Save] Title "Wallace & Gromit: The Curse of the Were-Rabbit" - Short: false
2025-11-17 22:50:32.962 [info] ✅ [DB Save] Title match: "Wallace & Gromit - La maledizione del coniglio mannaro - The Curse of the Were-Rabbit (2005) UpScaled 2160p H265 BluRay Rip 10 bit HDR ita eng AC3 5.1 sub ita eng NUeng Licdom" (100% match with "Wallace & Gromit: The Curse of the Were-Rabbit")
2025-11-17 22:50:32.962 [info] 💾 [DB Save] Processing: Wallace & Gromit - La maledizione del coniglio mannaro - The Curse of the Were-Rabbit (2005) UpScaled 2160p H265 BluRay Rip 10 bit HDR ita eng AC3 5.1 sub ita eng NUeng Licdom - Size: 3.96 GiB (4252017623 bytes), Seeders: 2
2025-11-17 22:50:32.962 [info] ✅ [DB Save] Title match: "Wallace & Gromit - La maledizione del coniglio mannaro - The Curse of the Were-Rabbit (2005) 1080p H265 BluRay Rip ita eng AC3 5.1 sub ita eng NUeng Licdom" (100% match with "Wallace & Gromit: The Curse of the Were-Rabbit")
2025-11-17 22:50:32.962 [info] 💾 [DB Save] Processing: Wallace & Gromit - La maledizione del coniglio mannaro - The Curse of the Were-Rabbit (2005) 1080p H265 BluRay Rip ita eng AC3 5.1 sub ita eng NUeng Licdom - Size: 2.26 GiB (2426656522 bytes), Seeders: 4
2025-11-17 22:50:32.962 [info] 🇮🇹 [DB Save] Matched with Italian title: "Wallace & Gromit - La maledizione del coniglio mannaro"
2025-11-17 22:50:32.962 [info] ✅ [DB Save] Title match: "Wallace & Gromit - La maledizione del coniglio mannaro 2005 x264 576p mkv ita" (100% match with "Wallace & Gromit - La maledizione del coniglio mannaro")
2025-11-17 22:50:32.962 [info] 💾 [DB Save] Processing: Wallace & Gromit - La maledizione del coniglio mannaro 2005 x264 576p mkv ita - Size: 905.57 MiB (949558968 bytes), Seeders: 1


    ~  ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177 \                                                                                                                       ✔ 
  "sudo -u postgres psql stremizio -c \"SELECT COUNT(*) FROM torrents WHERE title ILIKE '%maledizione del coniglio mannaro%';\""
# Expected: count = 0

 count
-------
     0
(1 row)


    ~  curl "https://stremizio2-amber.vercel.app/eyJ0bWRiX2tleSI6IjU0NjJmNzg0NjlmM2Q4MGJmNTIwMTY0NTI5NGMxNmU0IiwidXNlX3JkIjp0cnVlLCJyZF9rZXkiOiJCWlRFQ1pHWU1aNlNSSUhFMzJCQzZWRE1GN0NaTVU2VFlSUjVBVFMzRVFMQ01DQVlaSkhBIiwidXNlX2NvcnNhcm9uZXJvIjp0cnVlLCJ1c2VfdWluZGV4IjpmYWxzZSwidXNlX2tuYWJlbiI6ZmFsc2V9/stream/movie/tt0312004.json" | jq '.streams[0].title'
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  6424  100  6424    0     0   1083      0  0:00:05  0:00:05 --:--:--  1699
"🎬 Wallace & Gromit - La maledizione del coniglio mannaro - The Curse of the Were-Rabbit (2005) UpScaled 2160p H265 BluRay Rip 10 bit HDR ita eng AC3 5.1 sub ita eng NUeng Licdom\n📡 CorsaroNero | 💾 3.96 GiB | 👥 2 seeds\n📥🧲 Aggiungi a Real-Debrid (download necessario)\n📂 Movies"

    ~  ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177 \                                                                                                                ✔  6s  
  "sudo -u postgres psql stremizio -c \"SELECT COUNT(*) FROM torrents WHERE title ILIKE '%maledizione del coniglio mannaro%';\""
# Expected: count = 0

 count
-------
     1
(1 row)

```

**✅ PASS Criteria**:
- [ ] Film trovato su CorsaroNero
- [ ] Salvato nel DB con IMDb ID
- [ ] Salvato nel DB con TMDb ID
- [ ] Prossima ricerca usa DB (no live search)

---

### Test A3: Serie TV con Episodi (DB) 📺 FILE_INDEX

**Obiettivo**: Verificare selezione episodio specifico da pack

**Serie Test**: "Breaking Bad S01E01" - IMDb: tt0903747

**Steps**:

1. **Verifica episodi nel DB via curl**
```bash
curl "https://stremizio2-amber.vercel.app/eyJ0bWRiX2tleSI6IjU0NjJmNzg0NjlmM2Q4MGJmNTIwMTY0NTI5NGMxNmU0IiwidXNlX3JkIjp0cnVlLCJyZF9rZXkiOiJCWlRFQ1pHWU1aNlNSSUhFMzJCQzZWRE1GN0NaTVU2VFlSUjVBVFMzRVFMQ01DQVlaSkhBIiwidXNlX2NvcnNhcm9uZXJvIjp0cnVlLCJ1c2VfdWluZGV4IjpmYWxzZSwidXNlX2tuYWJlbiI6ZmFsc2V9/stream/series/1396:1:1.json" | jq '.streams[] | select(.title | contains("S01E01")) | {title: .title, infoHash: .infoHash, fileIdx: .fileIdx}' | head -5
```

2. **Verifica DB per episodi**
```bash
ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177 \
  "sudo -u postgres psql stremizio -c \"SELECT t.info_hash, t.title, f.file_index, f.title as filename, f.imdb_season, f.imdb_episode FROM torrents t JOIN files f ON t.info_hash = f.info_hash WHERE t.imdb_id = 'tt0903747' AND f.imdb_season = 1 AND f.imdb_episode = 1 LIMIT 3;\""
```

3. **Cerca serie su addon**
```bash
curl "https://stremizio2-amber.vercel.app/eyJ0bWRiX2tleSI6IjU0NjJmNzg0NjlmM2Q4MGJmNTIwMTY0NTI5NGMxNmU0IiwidXNlX3JkIjp0cnVlLCJyZF9rZXkiOiJCWlRFQ1pHWU1aNlNSSUhFMzJCQzZWRE1GN0NaTVU2VFlSUjVBVFMzRVFMQ01DQVlaSkhBIiwidXNlX2NvcnNhcm9uZXJvIjp0cnVlLCJ1c2VfdWluZGV4IjpmYWxzZSwidXNlX2tuYWJlbiI6ZmFsc2V9/stream/series/1396:1:1.json" | jq '.streams[0]'
```

4. **Monitora log Vercel**
```bash
vercel logs --follow
```

**Cerca nel log**:
```
📺 [SERIES] Searching for: Breaking Bad S01E01
💾 [DB] Found 5 torrents with 15 files
🎯 [FILE] Selected: Breaking.Bad.S01.Complete/S01E01.mkv [idx:0]
🔗 [RD] infoHash=XXXX&fileIdx=0
```

5. **Incolla risultati**
```
[INCOLLA LOG + DB QUERY + curl OUTPUT]
```

**✅ PASS Criteria**:
- [ ] Episodi trovati nel DB
- [ ] file_index presente nel risultato
- [ ] Stream parte dall'episodio corretto (non inizio pack)

---

### Test A4: Serie SENZA Episodi (Parsing) 🔧 CRITICO

**Obiettivo**: Verificare parsing episodi da RealDebrid e salvataggio per TUTTI

**Serie Test**: Trova pack serie SENZA episodi nel DB

**Steps**:

1. **Trova pack senza episodi**
```bash
ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177 \
  "sudo -u postgres psql stremizio -c \"SELECT t.info_hash, t.title, t.type FROM torrents t LEFT JOIN files f ON t.info_hash = f.info_hash WHERE t.type = 'series' AND f.info_hash IS NULL LIMIT 5;\""
```

2. **Copia info_hash di uno**
```
info_hash = [HASH]
```

3. **Cerca serie su Stremio con episodio specifico**
```bash
# Sostituisci TMDB_ID e season:episode
curl "https://stremizio2-amber.vercel.app/eyJ0bWRiX2tleSI6IjU0NjJmNzg0NjlmM2Q4MGJmNTIwMTY0NTI5NGMxNmU0IiwidXNlX3JkIjp0cnVlLCJyZF9rZXkiOiJCWlRFQ1pHWU1aNlNSSUhFMzJCQzZWRE1GN0NaTVU2VFlSUjVBVFMzRVFMQ01DQVlaSkhBIiwidXNlX2NvcnNhcm9uZXJvIjp0cnVlLCJ1c2VfdWluZGV4IjpmYWxzZSwidXNlX2tuYWJlbiI6ZmFsc2V9/stream/series/TMDB_ID:1:1.json" | jq '.streams[] | select(.infoHash == "[HASH]")'
```

4. **Monitora log Vercel**
```bash
vercel logs --follow
```

5. **Monitora log RealDebrid parsing**
```
🔵 [RealDebrid] Adding magnet to RD...
🔵 [RealDebrid] Torrent ID: ABC123XYZ
📁 [RealDebrid] Found X files in torrent
🔍 [RealDebrid] Searching for S01E01 in filenames...
✅ [RealDebrid] Matched file: Series.S01E01.mkv (fileIndex: 5)
💾 [DB] Saving file info for ALL USERS...
INSERT INTO files (info_hash, file_index, ...)
✅ [DB] Saved X episodes
```

6. **Verifica DB dopo**
```bash
ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177 \
  "sudo -u postgres psql stremizio -c \"SELECT file_index, title, imdb_season, imdb_episode FROM files WHERE info_hash = 'HASH_DEL_PACK' ORDER BY imdb_season, imdb_episode;\""
```

7. **Test con ALTRO utente (API key diversa)**
- Usa account Stremio diverso
- Cerca stesso episodio
- Verifica NO parsing RD (usa file_index dal DB)

8. **Incolla risultati**
```
[INCOLLA LOG + DB QUERY]
```

**✅ PASS Criteria**:
- [ ] Parsing RD eseguito per User A
- [ ] Episodi salvati nel DB
- [ ] User B trova file_index già popolato (no parsing)
- [ ] Entrambi gli utenti riproducono correttamente

---

## 🎯 **PRIORITÀ 3: TEST REALDEBRID CACHE**

### Test RD1: Torrent NON Cached 🔴 NO CACHE

**Obiettivo**: Verificare gestione torrent non cached

**Setup**: Usa API key RD SEPARATA (non la tua)

**Steps**:

1. **Trova torrent con pochi seeds**
```bash
ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177 \
  "sudo -u postgres psql stremizio -c \"SELECT info_hash, title, seeders, cached_rd FROM torrents WHERE seeders < 5 AND cached_rd IS NULL LIMIT 1;\""
```

2. **Cerca contenuto su Stremio via API**
```bash
# Sostituisci TMDB_ID con quello del film/serie trovato
curl "https://stremizio2-amber.vercel.app/ALTRA_CONFIG/stream/movie/TMDB_ID.json" | jq '.streams[] | select(.infoHash == "HASH_TEST")'
```

3. **Monitora log Vercel**
```bash
vercel logs --follow
```

**Cerca nel log**:
```
🔵 RD Cache check: X hashes
💾 [DB Cache] 0/X hashes found in cache
🔵 [RealDebrid] API Call: /torrents/instantAvailability/HASH...
❌ [RealDebrid] Hash ABC123... NOT cached
💾 [DB] Updating cached_rd = false, last_cached_check = NOW()
```

4. **Verifica DB**
```bash
ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177 \
  "sudo -u postgres psql stremizio -c \"SELECT cached_rd, last_cached_check FROM torrents WHERE info_hash = 'HASH_TEST';\""
# Expected: cached_rd = false, last_cached_check = NOW()
```

5. **Incolla log**
```
[INCOLLA LOG QUI]
```

**✅ PASS Criteria**:
- [ ] API RD chiamata
- [ ] cached_rd = false nel DB
- [ ] last_cached_check = timestamp corrente
- [ ] Stream NON disponibile (no badge ⚡ RD)

---

### Test RD2: Torrent Cached ✅ IN CACHE

**Obiettivo**: Verificare torrent cached disponibile immediatamente

**Film Test**: Film popolare (Marvel, Star Wars, etc.)

**Steps**:

1. **Cerca film popolare su Stremio via API**
```bash
# Usa The Shawshank Redemption (TMDb: 278)
curl "https://stremizio2-amber.vercel.app/ALTRA_CONFIG/stream/movie/278.json" | jq '.streams[0:3] | .[] | {title: .title, infoHash: .infoHash}'
```

2. **Monitora log Vercel**
```bash
vercel logs --follow
```

**Cerca nel log**:
```
🔵 [RealDebrid] API Call: /torrents/instantAvailability/HASH...
✅ [RealDebrid] Hash ABC123... CACHED (X variants)
💾 [DB] Updating cached_rd = true, last_cached_check = NOW()
```

3. **Verifica DB**
```bash
ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177 \
  "sudo -u postgres psql stremizio -c \"SELECT cached_rd, last_cached_check FROM torrents WHERE info_hash = 'HASH_TEST';\""
# Expected: cached_rd = true
```

5. **Incolla log**
```
[INCOLLA LOG QUI]
```

**✅ PASS Criteria**:
- [ ] cached_rd = true nel DB
- [ ] Badge ⚡ RD visibile
- [ ] Stream disponibile immediatamente

---

### Test RD3: Cache DB (< 5 giorni) ⏩ NO API CALL

**Obiettivo**: Verificare uso cache DB invece di API

**Steps**:

1. **Trova torrent con cache recente**
```bash
ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177 \
  "sudo -u postgres psql stremizio -c \"SELECT info_hash, cached_rd, last_cached_check FROM torrents WHERE last_cached_check > NOW() - INTERVAL '5 days' AND cached_rd IS NOT NULL LIMIT 1;\""
```

2. **Cerca stesso contenuto via API**
```bash
# Sostituisci TMDB_ID con quello del torrent trovato
curl "https://stremizio2-amber.vercel.app/eyJ0bWRiX2tleSI6IjU0NjJmNzg0NjlmM2Q4MGJmNTIwMTY0NTI5NGMxNmU0IiwidXNlX3JkIjp0cnVlLCJyZF9rZXkiOiJCWlRFQ1pHWU1aNlNSSUhFMzJCQzZWRE1GN0NaTVU2VFlSUjVBVFMzRVFMQ01DQVlaSkhBIiwidXNlX2NvcnNhcm9uZXJvIjp0cnVlLCJ1c2VfdWluZGV4IjpmYWxzZSwidXNlX2tuYWJlbiI6ZmFsc2V9/stream/movie/TMDB_ID.json" | jq '.streams[] | select(.infoHash == "HASH_TEST")'
```

3. **Monitora log Vercel**
```bash
vercel logs --follow
```

**Cerca nel log**:
```
💾 [DB Cache] X/Y hashes found in cache (< 5 days)
ℹ️  [RealDebrid] Using DB cache, skipping API call
```

4. **Verifica NO chiamata API RD (nessun log "API Call")**

5. **Incolla log**
```
[INCOLLA LOG QUI]
```

**✅ PASS Criteria**:
- [ ] Cache usata dal DB
- [ ] NO chiamata API RD
- [ ] Risposta veloce (< 200ms)

---

### Test RD4: Cache Scaduta (> 5 giorni) 🔄 REFRESH

**Obiettivo**: Verificare refresh cache vecchia

**Steps**:

1. **Forza cache vecchia manualmente**
```bash
ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177 \
  "sudo -u postgres psql stremizio -c \"UPDATE torrents SET last_cached_check = NOW() - INTERVAL '6 days' WHERE info_hash = 'HASH_TEST';\""
```

2. **Cerca contenuto via API**
```bash
curl "https://stremizio2-amber.vercel.app/eyJ0bWRiX2tleSI6IjU0NjJmNzg0NjlmM2Q4MGJmNTIwMTY0NTI5NGMxNmU0IiwidXNlX3JkIjp0cnVlLCJyZF9rZXkiOiJCWlRFQ1pHWU1aNlNSSUhFMzJCQzZWRE1GN0NaTVU2VFlSUjVBVFMzRVFMQ01DQVlaSkhBIiwidXNlX2NvcnNhcm9uZXJvIjp0cnVlLCJ1c2VfdWluZGV4IjpmYWxzZSwidXNlX2tuYWJlbiI6ZmFsc2V9/stream/movie/TMDB_ID.json" | jq '.streams[] | select(.infoHash == "HASH_TEST")'
```

3. **Monitora log Vercel**
```bash
vercel logs --follow
```

**Cerca nel log**:
```
💾 [DB Cache] 0/X hashes found in cache (expired)
🔵 [RealDebrid] Refreshing cache...
✅ [RealDebrid] Updated cache status
💾 [DB] last_cached_check = NOW()
```

4. **Verifica DB**
```bash
ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177 \
  "sudo -u postgres psql stremizio -c \"SELECT last_cached_check FROM torrents WHERE info_hash = 'HASH_TEST';\""
# Expected: timestamp recente
```

5. **Incolla log**
```
[INCOLLA LOG QUI]
```

**✅ PASS Criteria**:
- [ ] API RD chiamata per refresh
- [ ] last_cached_check aggiornato
- [ ] Cache status aggiornato (true/false)

---

## 🎯 **PRIORITÀ 4: TEST ENRICHMENT VPS**

### Test E1: Enrichment Server Webhook (VPS) 🔧 CRITICO

**Obiettivo**: Verificare che VPS riceve webhook e processa enrichment

**Film Test**: "The Matrix (1999)" - IMDb: tt0133093, TMDb: 603

**Prerequisiti**:
- enrichment-server.js running su VPS (porta 3001)
- API Key: 67ec433ffd748f55c380a180b876657039f225958c8dce292fbbd71ae8748b67

**Steps**:

1. **Verifica server VPS online**
```bash
curl http://89.168.25.177:3001/health | jq
# Expected: {"status":"ok","uptime":XXX,"queue":0,"activeJobs":0,"maxConcurrent":1}
```

2. **Verifica film NON nel DB (o con pochi torrents)**
```bash
ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177 \
  "sudo -u postgres psql stremizio -c \"SELECT COUNT(*) FROM torrents WHERE imdb_id = 'tt0133093';\""
# Expected: 0-5 torrents (per testare enrichment)
```

3. **Chiama addon Vercel per The Matrix**
```bash
curl "https://stremizio2-amber.vercel.app/eyJ0bWRiX2tleSI6IjU0NjJmNzg0NjlmM2Q4MGJmNTIwMTY0NTI5NGMxNmU0IiwidXNlX3JkIjp0cnVlLCJyZF9rZXkiOiJCWlRFQ1pHWU1aNlNSSUhFMzJCQzZWRE1GN0NaTVU2VFlSUjVBVFMzRVFMQ01DQVlaSkhBIiwidXNlX2NvcnNhcm9uZXJvIjp0cnVlLCJ1c2VfdWluZGV4IjpmYWxzZSwidXNlX2tuYWJlbiI6ZmFsc2V9/stream/movie/603.json" | jq '.streams | length'
```

4. **Monitora log Vercel (webhook call)**
```bash
vercel logs --follow
```

**Cerca nel log Vercel**:
```
🚀 [Enrichment] Sending webhook to VPS...
🌐 POST http://89.168.25.177:3001/enrich
📦 Body: {"imdbId":"tt0133093","tmdbId":603,"type":"movie",...}
✅ [Enrichment] Webhook accepted (202)
```

5. **Monitora log VPS (processing)**
```bash
ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177 "pm2 logs enrichment-server --lines 50"
```

**Cerca nel log VPS**:
```
🎬 [Enrichment] Processing: The Matrix (tt0133093, tmdb:603)
🔍 Searching queries: ["The Matrix 1999", "The Matrix", "Matrix 1999"]
🏴‍☠️ Scraping CorsaroNero page 1/10...
🏴‍☠️ Found 12 torrents on page 1
📥 Downloading .torrent for: Matrix.1999.2160p.mkv
✅ Parsed episodes from .torrent: 0 files
💾 Saving 12 torrents to database...
✅ [Enrichment] Completed: added 12 new torrents
```

6. **Verifica DB dopo enrichment**
```bash
ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177 \
  "sudo -u postgres psql stremizio -c \"SELECT COUNT(*), MAX(upload_date) FROM torrents WHERE imdb_id = 'tt0133093';\""
# Expected: count aumentato di 10-20, upload_date recente
```

7. **Incolla risultati**
```
[INCOLLA LOG VERCEL + LOG VPS + DB COUNT]
```

**✅ PASS Criteria**:
- [ ] Health endpoint risponde
- [ ] Webhook 202 accepted
- [ ] VPS processa enrichment (log visibile)
- [ ] Scraping tutte pagine (1-10)
- [ ] Torrents salvati nel DB con IMDb/TMDb IDs
- [ ] Queue processed (activeJobs = 0 dopo completamento)

---

### Test E2: FTS Search Fallback (Tier 2) 🔍 3-TIER

**Obiettivo**: Verificare fallback DB → FTS → Live quando manca ID

**Film Test**: Film con titolo particolare nel DB ma senza IMDb ID

**Prerequisiti**: Torrent nel DB con title ma NULL imdb_id

**Steps**:

1. **Setup: Inserisci torrent test senza IDs**
```bash
ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177 \
  "sudo -u postgres psql stremizio -c \"
INSERT INTO torrents (info_hash, title, torrent_url, type, seeders, category, upload_date, imdb_id, tmdb_id)
VALUES ('1234567890ABCDEFTEST', 'Inception 2010 1080p BluRay', 'https://test.torrent', 'movie', 50, 'film', NOW(), NULL, NULL)
ON CONFLICT (info_hash) DO NOTHING;
\""
```

2. **Cerca "Inception" via addon (TMDb: 27205)**
```bash
curl "https://stremizio2-amber.vercel.app/eyJ0bWRiX2tleSI6IjU0NjJmNzg0NjlmM2Q4MGJmNTIwMTY0NTI5NGMxNmU0IiwidXNlX3JkIjp0cnVlLCJyZF9rZXkiOiJCWlRFQ1pHWU1aNlNSSUhFMzJCQzZWRE1GN0NaTVU2VFlSUjVBVFMzRVFMQ01DQVlaSkhBIiwidXNlX2NvcnNhcm9uZXJvIjp0cnVlLCJ1c2VfdWluZGV4IjpmYWxzZSwidXNlX2tuYWJlbiI6ZmFsc2V9/stream/movie/27205.json" | jq '.streams[] | select(.infoHash == "1234567890abcdeftest") | .title'
```

3. **Monitora log Vercel**
```bash
vercel logs --follow
```

**Cerca sequenza 3-tier**:
```
💾 [DB] Searching by IMDb: tt1375666 (movie)
💾 [DB] Found 0 torrents for IMDb tt1375666
💾 [DB] No results by IMDb, trying TMDb ID: 27205
💾 [DB] Searching by TMDb: 27205 (movie)
💾 [DB] Found 0 torrents for TMDb 27205
💾 [DB] No results by ID. Trying Full-Text Search (FTS)...
💾 [DB FTS] Cleaned title: "Inception"
💾 [DB FTS] Searching: "Inception" (movie) year=2010
💾 [DB FTS] Found 1 torrents (rank threshold applied)
✅ [DB FTS] Returning torrent: Inception 2010 1080p BluRay (hash: 1234567890...)
```

4. **Verifica stream trovato**
```bash
# Output deve contenere il torrent test
curl "..." | jq '.streams[] | select(.title | contains("Inception 2010 1080p BluRay"))'
```

5. **Cleanup: Rimuovi torrent test**
```bash
ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177 \
  "sudo -u postgres psql stremizio -c \"DELETE FROM torrents WHERE info_hash = '1234567890ABCDEFTEST';\""
```

6. **Incolla log**
```
[INCOLLA LOG VERCEL + CURL OUTPUT]
```

**✅ PASS Criteria**:
- [ ] Tier 1 (IMDb) → MISS
- [ ] Tier 1 (TMDb) → MISS
- [ ] Tier 2 (FTS) → HIT (trova torrent per titolo)
- [ ] Stream ritornato correttamente

---

### Test E3: Enrichment ALWAYS (Non-conditional) 🔄 SEMPRE

**Obiettivo**: Verificare che enrichment parte SEMPRE, non solo se titolo diverso

**Film Test**: "Interstellar (2014)" - IMDb: tt0816692, TMDb: 157336

**Prerequisiti**: 
- api/index.js con enrichment ALWAYS (no conditional check)
- Film già nel DB con 1-2 torrents

**Steps**:

1. **Verifica film già nel DB**
```bash
ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177 \
  "sudo -u postgres psql stremizio -c \"SELECT COUNT(*) FROM torrents WHERE imdb_id = 'tt0816692';\""
# Expected: > 0 (film già presente)
```

2. **Chiama addon per Interstellar**
```bash
curl "https://stremizio2-amber.vercel.app/eyJ0bWRiX2tleSI6IjU0NjJmNzg0NjlmM2Q4MGJmNTIwMTY0NTI5NGMxNmU0IiwidXNlX3JkIjp0cnVlLCJyZF9rZXkiOiJCWlRFQ1pHWU1aNlNSSUhFMzJCQzZWRE1GN0NaTVU2VFlSUjVBVFMzRVFMQ01DQVlaSkhBIiwidXNlX2NvcnNhcm9uZXJvIjp0cnVlLCJ1c2VfdWluZGV4IjpmYWxzZSwidXNlX2tuYWJlbiI6ZmFsc2V9/stream/movie/157336.json" | jq '.streams | length'
```

3. **Monitora log Vercel (MUST show enrichment)**
```bash
vercel logs --follow
```

**Cerca nel log (DEVE APPARIRE SEMPRE)**:
```
🇮🇹 Found Italian title: "Interstellar"
📚 Final search queries: [ 'Interstellar 2014', 'Interstellar' ]
🔍 [Background Check] dbEnabled=true, mediaDetails=true, tmdbId=157336, imdbId=tt0816692
🚀 [Background] Saving X CorsaroNero results to DB
🌐 POST http://89.168.25.177:3001/enrich (webhook call)
```

**❌ NON DEVE APPARIRE**:
```
⏭️  [Enrichment] Skipping: Italian title same as original
⏭️  [Enrichment] No Italian title, skipping background enrichment
```

4. **Verifica che NON ci sia conditional skip**
```bash
# Nel codice api/index.js NON deve esserci:
# if (italianTitle && italianTitle !== mediaDetails.title) {
grep -n "italianTitle !== mediaDetails.title" api/index.js
# Expected: NO match (riga commentata o rimossa)
```

5. **Incolla log**
```
[INCOLLA LOG VERCEL]
```

**✅ PASS Criteria**:
- [ ] Enrichment webhook chiamato SEMPRE
- [ ] NO log "Skipping enrichment"
- [ ] Background process avviato anche con titolo identico
- [ ] api/index.js NO conditional check `if (italianTitle !== ...)`

---

### Test E4: COALESCE Auto-Repair (NULL Update) 🔧 DB LOGIC

**Obiettivo**: Verificare che torrents con NULL IDs vengono aggiornati, ma IDs esistenti NO

**Torrent Test**: Hash esistente con NULL imdb_id

**Steps**:

1. **Setup: Crea torrent con NULL IDs**
```bash
ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177 \
  "sudo -u postgres psql stremizio -c \"
INSERT INTO torrents (info_hash, title, torrent_url, type, seeders, category, upload_date, imdb_id, tmdb_id)
VALUES ('TESTCOALESCE123456', 'The Dark Knight 2008 1080p', 'https://test.torrent', 'movie', 100, 'film', NOW(), NULL, NULL)
ON CONFLICT (info_hash) DO NOTHING;
SELECT imdb_id, tmdb_id FROM torrents WHERE info_hash = 'TESTCOALESCE123456';
\""
# Expected: imdb_id = NULL, tmdb_id = NULL
```

2. **Simula inserimento con IDs (via daily scraper logic)**
```bash
ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177 \
  "sudo -u postgres psql stremizio -c \"
INSERT INTO torrents (info_hash, title, torrent_url, type, seeders, category, upload_date, imdb_id, tmdb_id)
VALUES ('TESTCOALESCE123456', 'The Dark Knight 2008 1080p', 'https://test.torrent', 'movie', 100, 'film', NOW(), 'tt0468569', 155)
ON CONFLICT (info_hash) DO UPDATE SET
  imdb_id = COALESCE(torrents.imdb_id, EXCLUDED.imdb_id),
  tmdb_id = COALESCE(torrents.tmdb_id, EXCLUDED.tmdb_id),
  seeders = EXCLUDED.seeders;
SELECT imdb_id, tmdb_id FROM torrents WHERE info_hash = 'TESTCOALESCE123456';
\""
# Expected: imdb_id = tt0468569, tmdb_id = 155 (popolati da NULL)
```

3. **Test 2: Verifica NO overwrite di IDs esistenti**
```bash
ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177 \
  "sudo -u postgres psql stremizio -c \"
INSERT INTO torrents (info_hash, title, torrent_url, type, seeders, category, upload_date, imdb_id, tmdb_id)
VALUES ('TESTCOALESCE123456', 'The Dark Knight 2008 1080p', 'https://test.torrent', 'movie', 150, 'film', NOW(), 'tt9999999', 999)
ON CONFLICT (info_hash) DO UPDATE SET
  imdb_id = COALESCE(torrents.imdb_id, EXCLUDED.imdb_id),
  tmdb_id = COALESCE(torrents.tmdb_id, EXCLUDED.tmdb_id),
  seeders = EXCLUDED.seeders;
SELECT imdb_id, tmdb_id, seeders FROM torrents WHERE info_hash = 'TESTCOALESCE123456';
\""
# Expected: imdb_id = tt0468569 (NON tt9999999), tmdb_id = 155 (NON 999), seeders = 150 (aggiornato)
```

4. **Cleanup**
```bash
ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177 \
  "sudo -u postgres psql stremizio -c \"DELETE FROM torrents WHERE info_hash = 'TESTCOALESCE123456';\""
```

5. **Incolla risultati**
```
[INCOLLA OUTPUT QUERY]
```

**✅ PASS Criteria**:
- [ ] NULL IDs → Popolati da EXCLUDED (new values)
- [ ] Existing IDs → Mantenuti (COALESCE prende existing)
- [ ] seeders → Sempre aggiornato (non usa COALESCE)

---

### Test E5: Episode Extraction (.torrent vs RD) 📁 PARSING

**Obiettivo**: Verificare estrazione episodi da .torrent file prima di fallback RD

**Serie Test**: Pack con episodi nel .torrent - "Breaking Bad S01" pack

**Steps**:

1. **Trova pack serie nel DB**
```bash
ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177 \
  "sudo -u postgres psql stremizio -c \"
SELECT info_hash, title, torrent_url 
FROM torrents 
WHERE type = 'series' 
  AND title ILIKE '%Breaking Bad%' 
  AND title ILIKE '%Stagione 1%'
LIMIT 1;
\""
# Copia info_hash risultante
```

2. **Verifica NO episodi già mappati**
```bash
ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177 \
  "sudo -u postgres psql stremizio -c \"
SELECT COUNT(*) 
FROM files 
WHERE info_hash = '[HASH_COPIATO]';
\""
# Expected: 0 (no episodes mapped yet)
```

3. **Chiama addon per S01E01**
```bash
# Breaking Bad TMDb: 1396
curl "https://stremizio2-amber.vercel.app/eyJ0bWRiX2tleSI6IjU0NjJmNzg0NjlmM2Q4MGJmNTIwMTY0NTI5NGMxNmU0IiwidXNlX3JkIjp0cnVlLCJyZF9rZXkiOiJCWlRFQ1pHWU1aNlNSSUhFMzJCQzZWRE1GN0NaTVU2VFlSUjVBVFMzRVFMQ01DQVlaSkhBIiwidXNlX2NvcnNhcm9uZXJvIjp0cnVlLCJ1c2VfdWluZGV4IjpmYWxzZSwidXNlX2tuYWJlbiI6ZmFsc2V9/stream/series/1396:1:1.json" | jq '.streams[] | select(.infoHash == "[HASH]") | {title: .title, fileIdx: .fileIdx}'
```

4. **Monitora log Vercel**
```bash
vercel logs --follow
```

**Cerca nel log (ORDER importante)**:
```
📥 [Torrent] Downloading .torrent file: https://...
✅ [Torrent] Parsed 7 files from .torrent
📁 [Torrent] File 0: Breaking.Bad.S01E01.720p.mkv (1.2 GB)
📁 [Torrent] File 1: Breaking.Bad.S01E02.720p.mkv (1.3 GB)
...
🔍 [Episode Match] Looking for S01E01...
✅ [Episode Match] Found: Breaking.Bad.S01E01.720p.mkv (fileIndex: 0)
💾 [DB] Saving 7 episode mappings...
✅ [DB] Saved episode info for ALL USERS
```

**❌ NON DEVE APPARIRE (se .torrent OK)**:
```
⚠️  [Torrent] Failed to parse .torrent
🔵 [RealDebrid] Fallback to RD API parsing...
```

5. **Verifica DB dopo**
```bash
ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177 \
  "sudo -u postgres psql stremizio -c \"
SELECT file_index, title, imdb_season, imdb_episode 
FROM files 
WHERE info_hash = '[HASH_COPIATO]' 
ORDER BY imdb_season, imdb_episode 
LIMIT 10;
\""
# Expected: 7-8 rows con S01E01-E07, file_index 0-6
```

6. **Incolla log + query**
```
[INCOLLA LOG VERCEL + DB QUERY RESULTS]
```

**✅ PASS Criteria**:
- [ ] .torrent scaricato e parsato
- [ ] Episodi estratti PRIMA di chiamata RD
- [ ] file_index salvati nel DB
- [ ] Episodi disponibili per TUTTI gli utenti

---

### Test E6: VPS Memory Auto-Scaling 🧠 QUEUE

**Obiettivo**: Verificare queue sequential processing e memory monitoring

**Prerequisiti**: enrichment-server.js con MAX_CONCURRENT_JOBS=1

**Steps**:

1. **Verifica configurazione**
```bash
ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177 "grep 'MAX_CONCURRENT_JOBS' /home/ubuntu/enrichment-server.js"
# Expected: const MAX_CONCURRENT_JOBS = 1;
```

2. **Check memory baseline**
```bash
curl http://89.168.25.177:3001/health | jq '.memory'
# Expected: {"heapUsed":"18MB","heapTotal":"25MB","rss":"76MB"}
```

3. **Simula 3 enrichment requests in rapida successione**
```bash
# Request 1
curl -X POST http://89.168.25.177:3001/enrich \
  -H "Content-Type: application/json" \
  -H "X-API-Key: 67ec433ffd748f55c380a180b876657039f225958c8dce292fbbd71ae8748b67" \
  -d '{"imdbId":"tt0133093","tmdbId":603,"type":"movie","title":"The Matrix","year":1999}' &

# Request 2
curl -X POST http://89.168.25.177:3001/enrich \
  -H "Content-Type: application/json" \
  -H "X-API-Key: 67ec433ffd748f55c380a180b876657039f225958c8dce292fbbd71ae8748b67" \
  -d '{"imdbId":"tt0468569","tmdbId":155,"type":"movie","title":"The Dark Knight","year":2008}' &

# Request 3
curl -X POST http://89.168.25.177:3001/enrich \
  -H "Content-Type: application/json" \
  -H "X-API-Key: 67ec433ffd748f55c380a180b876657039f225958c8dce292fbbd71ae8748b67" \
  -d '{"imdbId":"tt1375666","tmdbId":27205,"type":"movie","title":"Inception","year":2010}' &

wait
```

4. **Verifica queue sequenziale**
```bash
curl http://89.168.25.177:3001/health | jq '{queue: .queue, activeJobs: .activeJobs}'
# Durante processing: {"queue":2,"activeJobs":1} o {"queue":1,"activeJobs":1}
# Dopo 5 minuti: {"queue":0,"activeJobs":0}
```

5. **Monitora log VPS**
```bash
ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177 "pm2 logs enrichment-server --lines 100"
```

**Cerca nel log**:
```
📥 [Queue] Job added: The Matrix (queue size: 1)
⚙️  [Queue] Processing: The Matrix (1/3)
... [scraping output] ...
✅ [Queue] Completed: The Matrix
📥 [Queue] Job added: The Dark Knight (queue size: 2)
⚙️  [Queue] Processing: The Dark Knight (1/2)
... [scraping output] ...
✅ [Queue] Completed: The Dark Knight
📥 [Queue] Job added: Inception (queue size: 1)
⚙️  [Queue] Processing: Inception (1/1)
```

**Verifica NO parallel processing**:
```
❌ NON DEVE APPARIRE:
⚙️  [Queue] Processing: The Matrix (1/3)
⚙️  [Queue] Processing: The Dark Knight (2/3)  <- NO parallel!
```

6. **Check memory dopo processing**
```bash
curl http://89.168.25.177:3001/health | jq '.memory'
# Memory deve rimanere stabile (< 150MB RSS)
```

7. **Verifica system memory**
```bash
ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177 "free -h"
# Swap usage NON deve aumentare significativamente
```

8. **Incolla risultati**
```
[INCOLLA LOG VPS + MEMORY STATS]
```

**✅ PASS Criteria**:
- [ ] Queue processa 1 job alla volta
- [ ] activeJobs mai > 1
- [ ] Memory stabile (< 150MB RSS)
- [ ] Swap NON aumenta durante processing
- [ ] Tutti e 3 i jobs completati sequenzialmente

---

## 🎯 **PRIORITÀ 5: TEST ANIME (Kitsu)**

### Test K1: Anime Episodio Range Match ✅ GIÀ TESTATO

**Status**: Testato con kitsu:12:123 (One Piece)

**Risultati precedenti**:
- ✅ Regex rileva ranges: E01-30, E131-143, E144-195
- ✅ Validation funziona: rifiuta 1999-2011 (anni)
- ❌ Problema: pack mancante (S03E93-130 non in DB)
- ✅ Fix: filtro categorie ora accetta 'film' e 'serie tv'

**Skip questo test** - già completato

---

### Test K2: Anime Pack Extraction 📁 EPISODI

**Obiettivo**: Verificare estrazione episodi da anime pack

**Anime Test**: "Attack on Titan S01" pack completo

**Steps**:

1. **Cerca anime pack via API**
```bash
# Attack on Titan S01E05 (TMDb: 1429)
curl "https://stremizio2-amber.vercel.app/eyJ0bWRiX2tleSI6IjU0NjJmNzg0NjlmM2Q4MGJmNTIwMTY0NTI5NGMxNmU0IiwidXNlX3JkIjp0cnVlLCJyZF9rZXkiOiJCWlRFQ1pHWU1aNlNSSUhFMzJCQzZWRE1GN0NaTVU2VFlSUjVBVFMzRVFMQ01DQVlaSkhBIiwidXNlX2NvcnNhcm9uZXJvIjp0cnVlLCJ1c2VfdWluZGV4IjpmYWxzZSwidXNlX2tuYWJlbiI6ZmFsc2V9/stream/series/1429:1:5.json" | jq '.streams[] | select(.title | contains("S01E05")) | {title: .title, fileIdx: .fileIdx}' | head -3
```

2. **Monitora log Vercel**
```bash
vercel logs --follow
```

**Cerca nel log**:
```
💾 [DB] Searching episode: ttXXXXXXX S1E5
📁 [RealDebrid] Parsing anime filenames...
✅ [RealDebrid] Matched: [SubsPlease] Attack.on.Titan.S01E05.mkv
💾 [DB] Saving anime episode mapping
```

3. **Verifica DB**
```bash
ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177 \
  "sudo -u postgres psql stremizio -c \"SELECT file_index, title, imdb_season, imdb_episode FROM files WHERE info_hash = 'HASH_ANIME_PACK' AND imdb_season = 1 AND imdb_episode = 5;\""
```

5. **Incolla log**
```
[INCOLLA LOG QUI]
```

**✅ PASS Criteria**:
- [ ] Episodi estratti correttamente
- [ ] file_index salvato nel DB
- [ ] Riproduzione parte dall'episodio corretto

---

## 🎯 **PRIORITÀ 5: TEST METRICHE & MONITORING**

### Test M1: Database Growth (1 settimana) 📈 CRESCITA

**Obiettivo**: Verificare crescita DB incrementale

**Steps**:

1. **Snapshot iniziale DB**
```bash
ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177 \
  "sudo -u postgres psql stremizio -c \"SELECT COUNT(*) as total_torrents, COUNT(CASE WHEN imdb_id IS NOT NULL THEN 1 END) as with_imdb, COUNT(CASE WHEN tmdb_id IS NOT NULL THEN 1 END) as with_tmdb, pg_size_pretty(pg_total_relation_size('torrents')) as size FROM torrents;\""
```

2. **Esegui daily scraper per 7 giorni** (test manuale nel tempo)

3. **Snapshot finale (dopo 7 giorni)**
```bash
# Stessa query di sopra
```

4. **Calcola crescita**
```bash
ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177 \
  "sudo -u postgres psql stremizio -c \"SELECT DATE(upload_date) as day, COUNT(*) as new_torrents FROM torrents WHERE upload_date >= NOW() - INTERVAL '7 days' GROUP BY DATE(upload_date) ORDER BY day;\""
```

5. **Incolla risultati**
```
[INCOLLA STATS QUI]
```

**✅ PASS Criteria**:
- [ ] Crescita: 500-1000 torrents/giorno
- [ ] ID coverage: > 80%
- [ ] Database size: crescita controllata (< 2 GB/settimana)

---

### Test M2: ID Coverage 📊 COPERTURA

**Obiettivo**: Verificare percentuale torrents con IDs

**Steps**:

**Steps**:

```bash
ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177 \
  "sudo -u postgres psql stremizio -c \"SELECT COUNT(*) as total, COUNT(CASE WHEN imdb_id IS NOT NULL THEN 1 END) as with_imdb, ROUND(100.0 * COUNT(CASE WHEN imdb_id IS NOT NULL THEN 1 END) / COUNT(*), 2) as imdb_coverage, COUNT(CASE WHEN tmdb_id IS NOT NULL THEN 1 END) as with_tmdb, ROUND(100.0 * COUNT(CASE WHEN tmdb_id IS NOT NULL THEN 1 END) / COUNT(*), 2) as tmdb_coverage FROM torrents;\""
```

**Target**:
```
imdb_coverage: > 85%
tmdb_coverage: > 90%
```

**Incolla risultati**
```
[INCOLLA STATS QUI]
```

**✅ PASS Criteria**:
- [ ] IMDb coverage > 85%
- [ ] TMDb coverage > 90%

---

### Test M3: Episode Coverage 📺 PACKS MAPPATI

**Obiettivo**: Verificare quanti pack hanno episodi mappati

**Steps**:

```bash
ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177 \
  "sudo -u postgres psql stremizio -c \"SELECT COUNT(DISTINCT t.info_hash) as total_packs, COUNT(DISTINCT f.info_hash) as packs_with_episodes, ROUND(100.0 * COUNT(DISTINCT f.info_hash) / COUNT(DISTINCT t.info_hash), 2) as coverage FROM torrents t LEFT JOIN files f ON t.info_hash = f.info_hash WHERE t.type = 'series';\""
```

**Target**: > 70% coverage

**Incolla risultati**
```
[INCOLLA STATS QUI]
```

**✅ PASS Criteria**:
- [ ] Episode coverage > 70%

---

## 📋 **TEMPLATE LOG TEST**

Per ogni test, usa questo template:

```markdown
## Test [CODICE]: [NOME TEST]

**Data**: YYYY-MM-DD HH:MM
**Tester**: [TUO NOME]
**Environment**: Production / Staging / Local

### Setup
[Prerequisiti e configurazione]

### Esecuzione
[Steps seguiti]

### Output
```
[LOG OUTPUT QUI]
```

### Database Query
```sql
[QUERY ESEGUITA]
```

### Risultati
```
[RISULTATI QUERY]
```

### Verifica
- [ ] Criterio 1
- [ ] Criterio 2
- [ ] Criterio 3

### Status: ✅ PASS / 🔴 FAIL

### Note
[Osservazioni aggiuntive]
```

---

## 🚨 **TROUBLESHOOTING RAPIDO**

### Problema: Module id-converter not found
```bash
# Verifica path
ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177 "ls -la /home/ubuntu/stremizio-scraper/lib/id-converter.cjs"

# Se mancante, ricopia
scp -i ~/.ssh/ssh-key-vps2.key lib/id-converter.cjs ubuntu@89.168.25.177:/home/ubuntu/stremizio-scraper/lib/
```

### Problema: Daily scraper processa 2500 torrents
```bash
# Verifica maxPages nel file server
ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177 "grep 'maxPages' /home/ubuntu/stremizio-scraper/daily-scraper.js"

# Deve essere: const maxPages = 20;
```

### Problema: Software/Musica processati
```bash
# Verifica whitelist categorie
ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177 "grep -A 10 'allowedCategories' /home/ubuntu/stremizio-scraper/daily-scraper.js"

# Deve avere: 'film', 'serie tv', 'animazione - film', etc.
```

### Problema: Nessun stream trovato
```bash
# Verifica DB connection
ssh -i ~/.ssh/ssh-key-vps2.key ubuntu@89.168.25.177 \
  "sudo -u postgres psql stremizio -c 'SELECT COUNT(*) FROM torrents;'"

# Verifica API key RD
curl -H "Authorization: Bearer YOUR_RD_KEY" https://api.real-debrid.com/rest/1.0/user
```

---

## ✅ **CHECKLIST FINALE**

Prima di considerare il sistema PRODUCTION READY:

**Daily Scraper**:
- [ ] Test S1: Deploy completato
- [ ] Test S2: id-converter funziona
- [ ] Test S3: Full run 20 pagine OK

**Addon API - Film**:
- [ ] Test A1: DB hit veloce
- [ ] Test A2: Enrichment funziona

**Addon API - Serie**:
- [ ] Test A3: Episodi dal DB
- [ ] Test A4: Parsing episodi RD

**RealDebrid Cache**:
- [ ] Test RD1: NOT cached OK
- [ ] Test RD2: Cached OK
- [ ] Test RD3: DB cache OK
- [ ] Test RD4: Refresh OK

**Anime**:
- [ ] Test K1: Range match (già OK)
- [ ] Test K2: Pack extraction

**Metriche**:
- [ ] Test M1: DB growth OK
- [ ] Test M2: ID coverage > 85%
- [ ] Test M3: Episode coverage > 70%

---

## 🎯 **PROSSIMI STEP**

1. **Oggi**: Test S1, S2, S3 (Deploy & Daily Scraper)
2. **Domani**: Test A1-A4 (Addon API)
3. **Giorno 3**: Test RD1-RD4 (RealDebrid)
4. **Giorno 4**: Test K2, M1-M3 (Anime & Metriche)
5. **Giorno 5**: Revisione finale e GO LIVE 🚀

---

**🔥 INIZIA DA TEST S1 - Deploy Daily Scraper! 🔥**
