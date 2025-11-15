const { Pool } = require('pg');

// Database connection pool
let pool = null;

/**
 * Initialize PostgreSQL connection pool
 * @param {Object} config - Database configuration
 * @returns {Pool} PostgreSQL pool instance
 */
function initDatabase(config = {}) {
  if (pool) return pool;

  // ✅ Hardcoded fallback credentials for VPS database
  pool = new Pool({
    host: config.host || process.env.DB_HOST || '89.168.25.177',
    port: config.port || process.env.DB_PORT || 5432,
    database: config.database || process.env.DB_NAME || 'stremizio',
    user: config.user || process.env.DB_USER || 'stremizio_user',
    password: config.password || process.env.DB_PASSWORD || 'stremizio',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000, // Vercel timeout-friendly
  });

  pool.on('error', (err) => {
    console.error('❌ Unexpected PostgreSQL error:', err);
  });

  console.log('✅ PostgreSQL Pool initialized');
  return pool;
}

/**
 * Search torrents by IMDb ID
 * @param {string} imdbId - IMDb ID (e.g., "tt0111161")
 * @param {string} type - Media type: 'movie' or 'series'
 * @returns {Promise<Array>} Array of torrent objects
 */
async function searchByImdbId(imdbId, type = null) {
  if (!pool) throw new Error('Database not initialized');
  
  try {
    console.log(`💾 [DB] Searching by IMDb: ${imdbId}${type ? ` (${type})` : ''}`);
    
    let query = `
      SELECT 
        info_hash, 
        provider, 
        title, 
        size, 
        type, 
        seeders, 
        imdb_id, 
        tmdb_id,
        cached_rd,
        last_cached_check
      FROM torrents 
      WHERE imdb_id = $1
    `;
    
    const params = [imdbId];
    
    if (type) {
      query += ' AND type = $2';
      params.push(type);
    }
    
    query += ' ORDER BY cached_rd DESC NULLS LAST, seeders DESC LIMIT 50';
    
    const result = await pool.query(query, params);
    console.log(`💾 [DB] Found ${result.rows.length} torrents for IMDb ${imdbId}`);
    
    return result.rows;
  } catch (error) {
    console.error(`❌ [DB] Error searching by IMDb:`, error.message);
    return [];
  }
}

/**
 * Search torrents by TMDb ID
 * @param {number} tmdbId - TMDb ID (e.g., 550)
 * @param {string} type - Media type: 'movie' or 'series'
 * @returns {Promise<Array>} Array of torrent objects
 */
async function searchByTmdbId(tmdbId, type = null) {
  if (!pool) throw new Error('Database not initialized');
  
  try {
    console.log(`💾 [DB] Searching by TMDb: ${tmdbId}${type ? ` (${type})` : ''}`);
    
    let query = `
      SELECT 
        info_hash, 
        provider, 
        title, 
        size, 
        type, 
        seeders, 
        imdb_id, 
        tmdb_id,
        cached_rd,
        last_cached_check
      FROM torrents 
      WHERE tmdb_id = $1
    `;
    
    const params = [tmdbId];
    
    if (type) {
      query += ' AND type = $2';
      params.push(type);
    }
    
    query += ' ORDER BY cached_rd DESC NULLS LAST, seeders DESC LIMIT 50';
    
    const result = await pool.query(query, params);
    console.log(`💾 [DB] Found ${result.rows.length} torrents for TMDb ${tmdbId}`);
    
    return result.rows;
  } catch (error) {
    console.error(`❌ [DB] Error searching by TMDb:`, error.message);
    return [];
  }
}

/**
 * Search episode files by IMDb ID, season, and episode
 * @param {string} imdbId - IMDb ID of the series
 * @param {number} season - Season number
 * @param {number} episode - Episode number
 * @returns {Promise<Array>} Array of file objects with torrent info
 */
async function searchEpisodeFiles(imdbId, season, episode) {
  if (!pool) throw new Error('Database not initialized');
  
  try {
    console.log(`💾 [DB] Searching episode: ${imdbId} S${season}E${episode}`);
    
    const query = `
      SELECT 
        f.file_index,
        f.title as file_title,
        f.size as file_size,
        t.info_hash,
        t.provider,
        t.title as torrent_title,
        t.size as torrent_size,
        t.seeders,
        t.imdb_id,
        t.tmdb_id,
        t.cached_rd,
        t.last_cached_check
      FROM files f
      JOIN torrents t ON f.info_hash = t.info_hash
      WHERE f.imdb_id = $1 
        AND f.imdb_season = $2 
        AND f.imdb_episode = $3
      ORDER BY t.cached_rd DESC NULLS LAST, t.seeders DESC
      LIMIT 50
    `;
    
    const result = await pool.query(query, [imdbId, season, episode]);
    console.log(`💾 [DB] Found ${result.rows.length} files for S${season}E${episode}`);
    
    return result.rows;
  } catch (error) {
    console.error(`❌ [DB] Error searching episode files:`, error.message);
    return [];
  }
}

/**
 * Insert new torrent into database
 * @param {Object} torrent - Torrent data
 * @returns {Promise<boolean>} Success status
 */
async function insertTorrent(torrent) {
  if (!pool) throw new Error('Database not initialized');
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Check if torrent exists
    const checkResult = await client.query(
      'SELECT info_hash FROM torrents WHERE info_hash = $1',
      [torrent.infoHash]
    );
    
    if (checkResult.rows.length > 0) {
      console.log(`💾 [DB] Torrent ${torrent.infoHash} already exists, skipping`);
      await client.query('ROLLBACK');
      return false;
    }
    
    // Insert torrent
    await client.query(
      `INSERT INTO torrents (
        info_hash, provider, title, size, type, 
        upload_date, seeders, imdb_id, tmdb_id
      ) VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7, $8)`,
      [
        torrent.infoHash,
        torrent.provider || 'ilcorsaronero',
        torrent.title,
        torrent.size || null,
        torrent.type,
        torrent.seeders || 0,
        torrent.imdbId || null,
        torrent.tmdbId || null
      ]
    );
    
    await client.query('COMMIT');
    console.log(`✅ [DB] Inserted torrent: ${torrent.title.substring(0, 60)}...`);
    return true;
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`❌ [DB] Error inserting torrent:`, error.message);
    return false;
  } finally {
    client.release();
  }
}

/**
 * Update RD cache status for multiple hashes
 * @param {Array} cacheResults - Array of {hash, cached} objects
 * @returns {Promise<number>} Number of updated records
 */
async function updateRdCacheStatus(cacheResults) {
  if (!pool) throw new Error('Database not initialized');
  if (!cacheResults || cacheResults.length === 0) return 0;
  
  try {
    let updated = 0;
    
    for (const result of cacheResults) {
      if (!result.hash) continue;
      
      const query = `
        UPDATE torrents 
        SET cached_rd = $1, last_cached_check = NOW()
        WHERE info_hash = $2
      `;
      
      const res = await pool.query(query, [result.cached, result.hash.toLowerCase()]);
      updated += res.rowCount;
    }
    
    console.log(`✅ [DB] Updated RD cache status for ${updated} torrents`);
    return updated;
    
  } catch (error) {
    console.error(`❌ [DB] Error updating RD cache:`, error.message);
    return 0;
  }
}

/**
 * Get cached RD availability for hashes (within 5 days)
 * @param {Array} hashes - Array of info hashes
 * @returns {Promise<Object>} Map of hash -> {cached: boolean, lastCheck: Date}
 */
async function getRdCachedAvailability(hashes) {
  if (!pool) throw new Error('Database not initialized');
  if (!hashes || hashes.length === 0) return {};
  
  try {
    const lowerHashes = hashes.map(h => h.toLowerCase());
    
    // Get cached results that are less than 5 days old
    const query = `
      SELECT info_hash, cached_rd, last_cached_check
      FROM torrents
      WHERE info_hash = ANY($1)
        AND cached_rd IS NOT NULL
        AND last_cached_check IS NOT NULL
        AND last_cached_check > NOW() - INTERVAL '5 days'
    `;
    
    const result = await pool.query(query, [lowerHashes]);
    
    const cachedMap = {};
    result.rows.forEach(row => {
      cachedMap[row.info_hash] = {
        cached: row.cached_rd,
        lastCheck: row.last_cached_check,
        fromCache: true
      };
    });
    
    console.log(`💾 [DB] Found ${result.rows.length}/${hashes.length} hashes with valid RD cache (< 5 days)`);
    
    return cachedMap;
    
  } catch (error) {
    console.error(`❌ [DB] Error getting RD cached availability:`, error.message);
    return {};
  }
}

/**
 * Close database connection
 */
async function closeDatabase() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('✅ PostgreSQL Pool closed');
  }
}

module.exports = {
  initDatabase,
  searchByImdbId,
  searchByTmdbId,
  searchEpisodeFiles,
  insertTorrent,
  updateRdCacheStatus,
  getRdCachedAvailability,
  closeDatabase
};
