const pg = require('../db/pg');

// Кэш метаданных (ключи — чистые имена, значения — объект с полями и реальным именем таблицы)
const metadataCache = {};

// Инициализация кэша метаданных при старте
async function initMetadataCache() {
  // Получаем все таблицы с нужными префиксами
  const tablesRes = await pg.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name ~ '^(cat|doc|sys|svb)[0-9]+__'`
  );
  for (const row of tablesRes.rows) {
    const realTable = row.table_name;
    // Чистое имя — часть после первого __
    const cleanName = realTable.split('__').slice(1).join('__');
    // Получаем все поля и их метаданные
    const fieldsRes = await pg.query(
      `SELECT
         c.column_name,
         c.data_type,
         c.is_nullable,
         c.column_default,
         pgd.description AS column_comment
       FROM information_schema.columns c
       LEFT JOIN pg_catalog.pg_statio_all_tables as st
         ON c.table_schema = st.schemaname AND c.table_name = st.relname
       LEFT JOIN pg_catalog.pg_description pgd
         ON pgd.objoid=st.relid AND pgd.objsubid=c.ordinal_position
       WHERE c.table_name = $1`, [realTable]
    );
    // Формируем поля: убираем префикс (до первого __)
    const fields = {};
    for (const f of fieldsRes.rows) {
      const cleanField = f.column_name.includes('__') ? f.column_name.split('__').slice(1).join('__') : f.column_name;
      fields[cleanField] = {
        db: f.column_name,
        type: f.data_type,
        comment: f.column_comment
      };
    }
    metadataCache[cleanName] = {
      realTable,
      fields
    };
  }
}

// Инициализируем кэш при первом require
initMetadataCache().catch(console.error);

// Внутренний доступ к полным метаданным
exports.getTableMetadata = (tableKey) => {
  return metadataCache[tableKey];
};

// API для фронта: все поля
exports.getPublicMetadata = async (req, res) => {
  const { table } = req.body;
  const meta = metadataCache[table];
  if (!meta) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unknown table' }));
    return;
  }
  // Все поля
  const fields = Object.entries(meta.fields)
    .map(([k, v]) => ({ name: k, title: v.comment || k }));
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ fields }));
}; 