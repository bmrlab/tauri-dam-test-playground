use std::path::PathBuf;

use rusqlite::{
    params,
    types::{FromSql, ValueRef},
    Connection, Result, ToSql,
};
use serde::{Deserialize, Serialize};

use crate::constant::{CRDT_TABLE, CR_SQLITE_ENDPOIONT};

#[derive(Serialize, Deserialize, Debug)]
struct CrsqlChangesRowData {
    table: String,
    pk: Vec<u8>,
    cid: String,
    val: serde_json::Value,
    col_version: i64,
    db_version: i64,
    site_id: Vec<u8>,
    cl: i64,
    seq: i64,
}

pub struct CrSqliteDB {
    conn: Connection,
}

// tear down the extension before closing the connection
// https://sqlite.org/forum/forumpost/c94f943821
impl Drop for CrSqliteDB {
    fn drop(&mut self) {
        let _ = self.conn.execute("SELECT crsql_finalize();", []);
    }
}

impl CrSqliteDB {
    fn init_connection(path: PathBuf, extension_path: PathBuf) -> Result<Connection> {
        let conn: Connection = Connection::open(path).expect("failed to open sqlite db");

        unsafe {
            conn.load_extension_enable()?;
            conn.load_extension(extension_path, Some(CR_SQLITE_ENDPOIONT))?;
        }
        Ok(conn)
    }

    fn as_crr(conn: &Connection, crr_table: &[&str]) -> Result<()> {
        let select_sql = crr_table
            .into_iter()
            .map(|table| format!("SELECT crsql_as_crr('{}');", table))
            .collect::<Vec<String>>()
            .join("\n");

        conn.execute_batch(
            format!(
                "
            BEGIN;
            {}
            COMMIT;",
                select_sql
            )
            .as_str(),
        )?;
        Ok(())
    }

    pub fn new(path: PathBuf, extension_path: PathBuf) -> Result<Self> {
        CrSqliteDB::init_connection(path, extension_path).map(|conn| {
            let _ = CrSqliteDB::as_crr(&conn, &CRDT_TABLE);
            CrSqliteDB { conn }
        })
    }

    fn pack(&self, id: impl ToSql) -> Result<Vec<u8>> {
        let sql = "SELECT crsql_pack_columns(?1);";
        self.conn.query_row(sql, params![id], |row| row.get(0))
    }

    fn unpack<T: FromSql>(&self, id: Vec<u8>) -> Result<T> {
        let sql = format!("SELECT cell from crsql_unpack_columns(?1);");
        self.conn
            .query_row(&sql, params![id], |row: &rusqlite::Row| row.get(0))
    }

    fn get_changes(&self) -> Result<Vec<CrsqlChangesRowData>> {
        let mut stmt = self.conn.prepare(r#"select "table", "pk", "cid", "val", "col_version", "db_version", COALESCE("site_id", crsql_site_id()), "cl", "seq" from crsql_changes;"#)?;

        let rows = stmt.query_map([], |row| {
            let table: String = row.get(0)?;
            let pk: Vec<u8> = row.get(1)?;
            let cid: String = row.get(2)?;

            let val = match row.get_ref(3)? {
                ValueRef::Text(text) => {
                    serde_json::Value::String(String::from_utf8(text.to_vec()).unwrap())
                }
                ValueRef::Blob(blob) => serde_json::Value::Array(
                    blob.iter()
                        .map(|&b| serde_json::Value::Number(b.into()))
                        .collect(),
                ),
                ValueRef::Integer(int) => serde_json::Value::Number(int.into()),
                ValueRef::Real(float) => {
                    serde_json::Value::Number(serde_json::Number::from_f64(float).unwrap())
                }
                ValueRef::Null => serde_json::Value::Null,
            };

            let col_version: i64 = row.get(4)?;
            let db_version: i64 = row.get(5)?;
            let site_id: Vec<u8> = row.get(6)?;

            let cl: i64 = row.get(7)?;
            let seq: i64 = row.get(8)?;

            Ok(CrsqlChangesRowData {
                table,
                pk,
                cid,
                val,
                col_version,
                db_version,
                site_id,
                cl,
                seq,
            })
        })?;

        Ok(rows.map(|r| r.unwrap()).collect())
    }

    pub fn get_changes_as_json(&self) -> Result<String> {
        let changes = self.get_changes()?;
        serde_json::to_string(&changes)
            .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))
    }

    pub fn apple_changes(&mut self, json_string: String) -> Result<()> {
        let datas: Vec<CrsqlChangesRowData> =
            serde_json::from_str::<Vec<CrsqlChangesRowData>>(&json_string)
                .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;
        let tx = self.conn.transaction()?;

        for d in datas {
            let val: Box<dyn ToSql> = match d.val {
                serde_json::Value::Bool(b) => Box::new(b),
                serde_json::Value::Number(n) => {
                    if let Some(i) = n.as_i64() {
                        Box::new(i)
                    } else if let Some(u) = n.as_u64() {
                        Box::new(u)
                    } else if let Some(f) = n.as_f64() {
                        Box::new(f)
                    } else {
                        Box::new(None::<i32>)
                    }
                }
                serde_json::Value::String(s) => Box::new(s),
                _ => Box::new(None::<i32>),
            };

            let _ = tx.execute("insert into crsql_changes ('table', 'pk', 'cid', 'val', 'col_version', 'db_version', 'site_id', 'cl', 'seq')
            values
            (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9);", params![
                d.table,
                d.pk,
                d.cid,
                val,
                d.col_version,
                d.db_version,
                d.site_id,
                d.cl,
                d.seq,
            ])?;
        }
        tx.commit()?;

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use rand::{distributions::Alphanumeric, Rng};

    fn load_extension() -> Connection {
        let conn = CrSqliteDB::init_connection(
            PathBuf::from("test.db"),
            PathBuf::from("/Users/zingerbee/Desktop/crsqlite.dylib"),
        )
        .unwrap();
        conn
    }

    fn setup() -> Connection {
        let conn = load_extension();
        conn.execute_batch(
            "
            BEGIN;
            DROP TABLE IF EXISTS todo;
            CREATE TABLE IF NOT EXISTS todo ('id' primary key not null, 'list', 'text', 'complete', 'updateTime' DATETIME DEFAULT CURRENT_TIMESTAMP);
            COMMIT;
            ",
        ).unwrap();
        CrSqliteDB::as_crr(&conn, &["todo"]).unwrap();
        conn
    }

    fn generate_random_string(length: usize) -> String {
        let mut rng = rand::thread_rng();
        std::iter::repeat(())
            .map(|()| rng.sample(Alphanumeric))
            .map(char::from)
            .take(length)
            .collect()
    }

    #[test]
    fn test_load_extension() {
        let conn = setup();

        let mut stmt = conn.prepare("SELECT crsql_db_version();").unwrap();
        let mut rows: rusqlite::Rows = stmt.query(params![]).unwrap();
        assert!(rows.next().unwrap().is_some());
    }

    #[test]
    fn test_pack() {
        let db: CrSqliteDB = CrSqliteDB { conn: setup() };

        let random_str = generate_random_string(8);
        println!("random_str: ${}", random_str.clone());
        let res: Vec<u8> = db.pack(random_str.clone()).unwrap();

        let unpack_str: String = db.unpack::<String>(res).unwrap();
        println!("unpack_str: ${unpack_str}");

        assert_eq!(random_str, unpack_str);
    }

    #[test]
    fn test_unpack() {
        let db: CrSqliteDB = CrSqliteDB { conn: setup() };

        let random_str = generate_random_string(8);
        println!("random_str: ${}", random_str.clone());

        let pack_res = db.pack(random_str.clone()).unwrap();

        let unpack_res: String = db.unpack::<String>(pack_res).unwrap();
        println!("unpack_res: ${}", unpack_res.clone());

        assert_eq!(random_str, unpack_res);
    }

    #[test]
    fn test_get_changes() {
        let conn = setup();
        let db: CrSqliteDB = CrSqliteDB { conn };
        db.conn
            .execute(
                "INSERT INTO todo (id, list, text, complete) VALUES (?1, ?2, ?3, ?4)",
                params![1, "list1", "text1", 0],
            )
            .unwrap();

        db.conn
            .execute("UPDATE todo SET complete = ?1 where id = 1;", params![1])
            .unwrap();
        db.conn
            .execute("UPDATE todo SET list = ?1 where id = 1;", params!["list2"])
            .unwrap();
        assert!(db.get_changes().unwrap().len() > 0);
    }
}
