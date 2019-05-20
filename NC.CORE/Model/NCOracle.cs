using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using Dapper;
using NC.CORE.Log;
using NC.CORE.Base;
using NC.CORE.Helper;
using System.Linq;
using System.Configuration;
using System.Data;
using NC.CORE.Xml;
using System.Dynamic;
using NC.CORE.Encrypt;
using System.Web;
using Oracle.DataAccess.Client;
namespace NC.CORE.Model
{
    public class NCOracle
    {
        private string _strcon = "";
        private Dictionary<string, string> _schema = null;
        private string _schema_table = "";
        private string _app = "";
        private dynamic _schema_config= new ExpandoObject();
        //Dapper declare object
        public IDbConnection _conn;
        //constructor default get connection string from Web.config
        public NCOracle()
        {

            if (ConfigurationManager.ConnectionStrings["KE_DB_ORACLE_READONLY"] != null)
            {
                this._strcon = ConfigurationManager.ConnectionStrings["KE_DB_ORACLE_READONLY"].ConnectionString;
                try
                {
                    this._conn = new OracleConnection(this._strcon);
                    //this._conn = new SqlConnection(this._strcon);
                    //this._conn.Open();
                    //this._conn.Close();
                    //this._app = app;
                }
                catch (SqlException e)
                {
                    NCLogger.Error("DB_SQL_DRIVER:" + e.Message.ToString());
                }
            }
        }
        //1. Init connection
        public bool checkConnection()
        {
            if (this._conn != null)
                return true;
            return false;
        }
        public void setApp(string app)
        {
            this._app = app;
            NCXml xml = new NCXml();
            NCHelper helper = new NCHelper();
            string path_config = helper.getVSPath() + "/Modules/" + this._app + "/conf.xml";
            if(!System.IO.File.Exists(path_config))
                path_config = helper.getAPPPath() + "/Modules/Core/" + this._app + "/conf.xml";
            NCLogger.Debug(path_config);
            this._schema_config = xml.XmlToDynamic(path_config);
        }
        public bool initConnection(string str_con_key)
        {
            //_logger.LogError("DB_CON:" + str_con);
            this._strcon = ConfigurationManager.ConnectionStrings[str_con_key].ConnectionString;
            //try
            //{

            this._conn = new SqlConnection(this._strcon);
            //this._conn.Open();
            //this._conn.Close();
            //}
            //catch (SqlException e)
            //{
            //    this._msg.setMsg("DB_SQL_DRIVER:" + e.Message.ToString());
            //}
            return false;
        }
        //2. Destroy connection
        public void destroyConnect()
        {
            if (this._conn != null)
                this._conn.Dispose();
        }

        //<!-- GET Data
        public string getValueByID(string table, string col, string valID)
        {
            NCLogger.Debug("select " + col + " from " + table + " where id=" + valID);
            var result = this._conn.ExecuteScalar<string>("select " + col + " from " + table + " where id=" + valID);
            return result;
        }
        //return multi data from a column with where = other column
        public List<string> getValueByColumn(string table, string RCol, string WCol, string WValue)
        {
            var result = this._conn.Query<string>("select " + RCol + " from " + table + " where " + WCol + "='" + WValue + "'").ToList();
            return result;
        }
        //return first data from a column with where = other column
        public string getFirstValueByColumn(string table, string RCol, string WCol, string WValue)
        {
            NCLogger.Debug("select " + RCol + " from " + table + " where " + WCol + "='" + WValue + "'");
            var result = this._conn.Query<string>("select " + RCol + " from " + table + " where " + WCol + "='" + WValue + "'").ToList();
            if (result.Count > 0)
                return result[0];
            return "";
        }
        public string getIDbyColumn(string table, string WCol, string WValue)
        {
            NCLogger.Debug("select id from " + table + " where " + WCol + "='" + WValue + "'");
            var result = this._conn.ExecuteScalar<string>("select id from " + table + " where " + WCol + "='" + WValue + "'");
            if (result == null)
                return "";
            return result;
        }
        //1. get data by sql string
        public IEnumerable<dynamic> ExecuteQuery(string sql, bool inject = true)
        {
            string query = sql;
            if (inject)
                query = this.queryBuilder(sql);
            NCLogger.Debug("SQL: " + sql);
            NCLogger.Debug("QUERY BUILDER:" + query);

            try
            {
                var rows = this._conn.Query(query);
                return rows;
            }
            catch (SqlException e)
            {
                NCLogger.Error(e.Message);
                return null;
            }

        }

        // Sql format: select xxx as id,yyy as val from ....
        public Dictionary<string, string> SelectToDictionary(string sql)
        {
            NCLogger.Debug(sql);
            Dictionary<string, string> d = new Dictionary<string, string>();
            d = this._conn.Query(sql).ToDictionary(
                 row => (string)row.id,
                row => (string)row.val);
            return d;
        }
        //1.1 get data by table name and string where
        public IEnumerable<dynamic> Select(string table, int id = 0, string select = "", string filter = "", string sort = "", string count = "")
        {

            string str_select = "";
            string str_filter = " where _deleted=0 ";
            string str_sort = "";
            //select
            if (select == "")
                str_select = "*";
            else
                str_select = select;
            //filter

            //filter security *******************
            if (id > 0)//priority id
                str_filter = " where id=" + id.ToString();
            else if (filter != "")
            {
                str_filter += " and " + filter;
            }
            //sort
            if (sort != "")
            {
                str_sort = " order by " + sort;
            }
            //count
            if (count != "")
            {
                str_select = " count(*) ";
            }
            //check table exists          
            if (this.checkExistColumn(table, "id"))
            {
                NCLogger.Debug("select " + str_select + " from " + table + str_filter + str_sort);
                var rows = this._conn.Query("select " + str_select + " from " + table + str_filter + str_sort);
                return rows;
            }
            else
            {
                NCLogger.Debug("Table: " + table + " not exists, check table name");
            }
            return null;
        }
        ////get data by table name, where clause is a dictionary, and operator join AND | OR
        
        //public IEnumerable<dynamic> Select(string table, Dictionary<string, string> columns, string op = "AND")
        //{
        //    //Enumerable.Count Count
        //    //Assert.Equal(1, (int)rows[0].A);
        //    //Assert.Equal(2, (int)rows[0].B);
        //    //Assert.Equal(3, (int)rows[1].A);
        //    //Assert.Equal(4, (int)rows[1].B);

        //    string sql = "select * from " + table + " where ";
        //    string strWhere = "";
        //    foreach (KeyValuePair<string, string> pair in columns)
        //    {
        //        if (this.checkExistColumn(table, pair.Key))
        //            strWhere += pair.Key + "='" + pair.Value + "' " + op + " ";
        //    }
        //    try
        //    {
        //        sql += strWhere.Substring(0, strWhere.Length - op.Length);
        //    }
        //    catch (Exception e)
        //    {
        //        NCLogger.Error("DB_SQL_STR_ERROR" + sql + " | " + e.Message);
        //    }
        //    try
        //    {
        //        NCLogger.Debug(sql);
        //        var rows = this._conn.Query(sql);
        //        return rows;
        //    }
        //    catch (SqlException e)
        //    {
        //        NCLogger.Error("DB_ERROR:" + e.Message);
        //        return null;
        //    }

        //}
        // GET Data -->


        //2. Insert 1 row
        //param 1: list colum 
        //param 2: list value
        //return last ID
        public long Insert(string table, Dictionary<string, string> columns,bool inject=true)
        {
            //security
            //...
            //valid data

            //create sql statment
            string sql = "insert into [" + table + "](";
            string sql_val = ") values(";
            foreach (string k in columns.Keys)
            {
                if (this.checkExistColumn(table, k))
                {
                    sql += "[" + k + "],";
                    if (this.getColumnType(table, k) == "encrypt")
                    {
                        SHA e = new SHA();
                        sql_val += "'" +e.GenerateSHA512String(columns[k]) + "',";
                    }else if (this.getColumnType(table, k) == "bit")
                    {   if(columns[k].ToUpper()=="TRUE")
                            sql_val += "1,";
                        else
                            sql_val += "0,";
                    }else if(this.checkUnicodeColumn(table, k))
                        sql_val += "N'" + columns[k] + "',";
                    else
                        sql_val += "'" + columns[k] + "',";
                }
            }
            //inject system column
            if (inject == true)
            {
                //set data system field
                if (!columns.ContainsKey("_deleted"))
                {
                    sql += "_deleted,";
                    sql_val += "0,";
                }
                if (!columns.ContainsKey("_active"))
                {
                    sql += "_active,";
                    sql_val += "1,";
                }
                sql += "_createdate,_updatedate";
                sql_val += "GETDATE(),GETDATE()";
                if (!columns.ContainsKey("_org_id"))
                {
                    sql += "org_id,";
                    //need to improve, not shouble be use direct in lib
                    sql_val += HttpContext.Current.Session["org_id"].ToString() + ",";
                }
                sql += "_createdate,_updatedate";
                sql_val += "GETDATE(),GETDATE()";
            }
            else
            {
                sql = sql.Substring(0, sql.Length - 1);
                sql_val = sql_val.Substring(0, sql_val.Length - 1);
            }
            
            sql += sql_val;
            sql += ")";
            NCLogger.Debug(sql);
            //run query
            try
            {
                var id = this._conn.Query<int>(sql + ";SELECT CAST(SCOPE_IDENTITY() AS INT)").Single();
                return Int64.Parse(id.ToString());
            }
            catch (SqlException e)
            {
                NCLogger.Error("DB_ERROR:" + sql + " | " + e.Message);
            }
            return 0;

        }
        //3. Update 1 row
        //param 1: list colum 
        //param 2: list value
        //return 1 for succcess | 0 for error
        public bool Update(string table, Dictionary<string, string> columns, long id)
        {
            string sql = "update " + table + " set ";
            foreach (KeyValuePair<string, string> c in columns)
            {
                if (this.checkExistColumn(table, c.Key))
                {
                    if (this.getColumnType(table, c.Key) == "encrypt")
                    {
                        SHA e = new SHA();
                        sql += "[" + c.Key + "]" + "='" + e.GenerateSHA512String(c.Value) + "',";
                    }else if (this.getColumnType(table, c.Key) == "bit")
                    {
                        if (c.Value.ToUpper() == "TRUE")
                            sql += "["+ c.Key +"]"+ "=1,";
                        else if(c.Value.ToUpper() == "FALSE")
                            sql += "[" + c.Key + "]" + "=0,";
                        else
                            sql += "[" + c.Key + "]" + "='" + c.Value + "',";
                    }
                    else if (this.checkUnicodeColumn(table, c.Key))
                        sql += "[" + c.Key + "]" + "=N'" + c.Value + "',";
                    else
                        sql += "[" + c.Key + "]" + "='" + c.Value + "',";
                }
            }
            sql = sql.Substring(0, sql.Length - 1);
            sql += " where id=" + id;
            NCLogger.Debug(sql);
            try
            {
                var r = this._conn.Execute(sql);
                if (Int64.Parse(r.ToString()) > 0)
                    return true;
                return false;
            }
            catch (SqlException e)
            {
                NCLogger.Error("DB_SQL_ERROR:" + sql + " | " + e.Message);
                return false;
            }
        }
        public bool UpdateByColumn(string table, Dictionary<string, string> columns, string wcol, string wval)
        {
            string sql = "update " + table + " set ";
            foreach (KeyValuePair<string, string> c in columns)
            {
                if (this.checkExistColumn(table, c.Key))
                {
                    if (this.getColumnType(table, c.Key) == "bit")
                    {
                        if (c.Value.ToUpper() == "TRUE")
                            sql += "[" + c.Key + "]" + "=1,";
                        else if(c.Value.ToUpper() == "FALSE")
                            sql += "[" + c.Key + "]" + "=0,";
                        else
                            sql += "[" + c.Key + "]" + "='" + c.Value + "',"; 
                    }
                    else if (this.checkUnicodeColumn(table, c.Key))
                        sql += "[" + c.Key + "]" + "=N'" + c.Value + "',";
                    else
                        sql += "[" + c.Key + "]" + "='" + c.Value + "',";
                }
            }
            sql = sql.Substring(0, sql.Length - 1);
            sql += " where " + wcol + "='" + wval+"'";
            NCLogger.Debug(sql);
            try
            {
                var r = this._conn.Execute(sql);
                if (Int64.Parse(r.ToString()) > 0)
                    return true;
                return false;
            }
            catch (SqlException e)
            {
                NCLogger.Error("DB_SQL_ERROR:" + sql + " | " + e.Message);
                return false;
            }
        }
        //3. Delete
        public Int64 Delete(string table, long id)
        {
            string sql = "delete from " + table + " where id=" + id;
            NCLogger.Debug(sql);
            try
            {
                var r = this._conn.Execute(sql);
                return Int64.Parse(r.ToString());
            }
            catch (SqlException e)
            {
                NCLogger.Error("DB_SQL_ERROR:" + sql + " | " + e.Message);
                return 0;
            }
        }
        public Int64 Delete(string table, string strwhere)
        {
            string sql = "delete " + table + " where " + strwhere;
            try
            {
                var r = this._conn.Execute(sql);
                return Int64.Parse(r.ToString());
            }
            catch (SqlException e)
            {
                NCLogger.Error("DB_SQL_ERROR:" + sql + " | " + e.Message);
                return 0;
            }
        }
        //5.Execute Query complex
        //public IEnumerable<dynamic> Query()
        //{

        //}
        public Dictionary<string, string> getColumns(string table)
        {
            string sql = "SELECT column_name,data_type FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = N'" + table + "'";
            try
            {
                var d = _conn.Query(sql).ToDictionary(x => (String)x.column_name, x => (String)x.data_type);
                return d;
            }
            catch (SqlException e)
            {
                NCLogger.Error("DB_ERROR:" + e.Message);
                return null;
            }
        }
        public bool checkExistColumn(string table, string column_name)
        {
            if (this._schema == null)
                this._schema = this.getColumns(table);
            else if (table != this._schema_table)
            {
                this._schema_table = table;
                this._schema = this.getColumns(table);
            }
            //foreach(string k in this._schema.Keys){
            //    NCLogger.Debug("KEY:"+k+"-colmun_name:"+column_name);
            //}
            if (this._schema.ContainsKey(column_name))
                return true;
            return false;
        }
        public bool checkUnicodeColumn(string table, string column_name)
        {
            if (this._schema == null)
                this._schema = this.getColumns(table);
            else if (table != this._schema_table)
            {
                this._schema_table = table;
                this._schema = this.getColumns(table);
            }
            if(this._schema[column_name]== "nvarchar" || this._schema[column_name] == "text")
            {
                return true;
            }
            return false;
        }
        public string getColumnType(string table,string column_name)
        {
            string t = this.getColumnTypeFromConfig(table, column_name);
            if (t != "")
                return t;
            if (this._schema == null)
                this._schema = this.getColumns(table);
            else if (table != this._schema_table)
            {
                this._schema_table = table;
                this._schema = this.getColumns(table);
            }
            if (this._schema.ContainsKey(column_name))
                return this._schema[column_name];
            return "";
        }
        public string getColumnTypeFromConfig(string table,string column_name)
        {
            NCHelper h = new NCHelper();
            if (this._schema_config != null)
            {
                if (!h.hasPropertyInJSON(this._schema_config, "module.models.model"))
                      return "";
                var model = this._schema_config["module"]["models"]["model"];
                if (model.Count > 0)
                {
                    //NCLogger.Debug("models.model.Count:"+ h.hasPropertyInJSON(models, "model") );
                    foreach (var m in model)
                    {
                        if (m.name == table)
                        {
                            if (m.columns.column.Count > 0)
                            {
                                foreach (var c in m.columns.column)
                                {
                                    //NCLogger.Debug("COLUMN NAME:"+c.name);
                                    if (column_name == c.name.ToString())
                                    {
                                        return c.type.ToString();
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return "";
        }
        public bool checkActive(string table, string val)
        {
            if (this.getValueByID(table, "_active", val) == "True")
                return true;
            return false;
        }
        public bool checkDeleted(string table, string val)
        {
            //NCLogger.Info(this.getValueByID(table, "_deleted", val).ToString());
            if (this.getValueByID(table, "_deleted", val) == "True")
                return true;
            return false;
        }
        public string getCreateDate(string table, string val, string f = "dd/MM/yyyy HH:mm")
        {
            NCHelper helper = new NCHelper();
            string s = helper.datetostring(this.getValueByID(table, "_createdate", val), f);
            if (s != "")
            {
                NCLogger.Error("DATE_NOT_VALID_CONVERT");
            }
            return s;

        }
        public string getLastUpdateDate(string table, string val, string f = "dd/MM/yyyy HH:mm")
        {
            NCHelper helper = new NCHelper();
            string s = helper.datetostring(this.getValueByID(table, "_modifydate", val), f);
            if (s != "")
            {
                NCLogger.Error("DATE_NOT_VALID_CONVERT");
            }
            return s;
        }
        public string queryBuilder(string query)
        {
            //add more system condition to here
            return query;
        }

    }
}
