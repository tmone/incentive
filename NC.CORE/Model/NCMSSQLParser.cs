using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.SqlServer.Management.SqlParser.Parser;
using Dapper;
using System.Data.SqlClient;
using System.Data;
using NC.CORE.Log;
namespace NC.CORE.SQLParser
{
    public class NCMSSQLParser
    {
        public string generateSQL(IDbConnection conn, string query, long userid, bool inject = true)
        {
            NCLogger.Debug("==>PASER:" + query);
            //replace "AS"
            query = query.Replace(" as ", " ");
            query = query.Replace(" AS ", " ");
            //replace DBO.
            query = query.Replace("[dbo].", " ");
            query = query.Replace("dbo.", " ");
            query = query.Replace("[DBO].", " ");
            query = query.Replace("DBO.", " ");
            //MessageBox.Show(query);

            string sql = "";
            NCSQLToken t_now;
            NCSQLToken t_next;
            List<NCSQLToken> l = setDeep(query);
            //fix error prase not enought element of TSQLPRASE
            //int number_of_left_parenthesis = 0;
            //int number_of_right_parenthesis = 0;
            //for (int i = 0; i < query.Length; i++)
            //{
            //    if()
            //}
            //MessageBox.Show(l.Count.ToString());
            for (int i = 0; i < l.Count; i++)
            {
                t_now = l[i];

                if (i < l.Count - 1)
                    t_next = l[i + 1];
                else
                    t_next = null;
                if (t_now.Type.ToUpper() == "TOKEN_FROM" && t_next != null)
                {
                    //detect next element is Keyword or table name
                    while (t_next.Type.ToUpper() != "TOKEN_ID" && t_next.Type.ToUpper() != "TOKEN_SELECT")
                    {
                        i = i + 1;
                        t_next = l[i];
                    }
                    if (t_next.Type.ToString().ToUpper() == "TOKEN_SELECT")//if next element is Keyword, pass this case
                    {
                        continue;
                    }
                    else
                    //indentify table name
                    {
                        //check table name in Filter config
                        List<string> rules = getFilter(conn, t_next.Text, userid);
                        //find alias
                        string alias = findAlias(l, i + 2);
                        //add _deleted system column to where clause for limit select result
                        if (inject)
                            rules.Add(t_next.Text + "._deleted=0");
                        if (rules.Count > 0)
                        {
                            //if table name exists in Filter config, find WHERE clause same level and add more filter Role
                            int pos_where = findWhereClauseSameDeep(l, i + 1, t_now.Deep);
                            bool existWhere = true;
                            if (pos_where == -1)
                            {//don't have where clause
                                pos_where = findLastElement(l, t_next.Text, i + 1, t_now.Deep);
                                l[pos_where].Where = " where ";
                                existWhere = false;
                            }
                            //add filter rule to where clause
                            foreach (string r in rules)
                            {
                                //MessageBox.Show(t_next.Text +"-"+alias);
                                if (alias != "")
                                {
                                    string str_filter = "";
                                    //find tablename and replace by Alias
                                    List<NCSQLToken> tokenWhere = setDeep(r);
                                    for (int j = 0; j < tokenWhere.Count - 1; j++)
                                    {
                                        if (tokenWhere[j].Deep == 0 && tokenWhere[j].Text == t_next.Text && tokenWhere[j].Type.ToUpper() == "TOKEN_ID")
                                        {
                                            str_filter += " " + alias;
                                        }
                                        else
                                            str_filter += " " + tokenWhere[j].Text;
                                    }

                                    //replace " . " by "." after change above
                                    l[pos_where].Where += str_filter.Replace(" . ", ".") + " and ";
                                    //
                                }
                                else
                                    l[pos_where].Where += " " + r + " and ";
                            }
                            // MessageBox.Show(l[pos_where].Where.Substring(l[pos_where].Where.Length - 4));
                            if (l[pos_where].Where.Substring(l[pos_where].Where.Length - 4) == "and " && existWhere == false)
                                l[pos_where].Where = l[pos_where].Where.Substring(0, l[pos_where].Where.Length - 4);
                        }

                    }
                }
                else if (t_now.Text.ToUpper().ToUpper() == "WHERE" && t_now.Type.ToString().ToUpper() == "KEYWORD")
                {

                }
                sql += " " + t_now.Text;

            }
            string full_query = "";
            int k = 0;
            for (k = 0; k < l.Count; k++)
            {
                if (l[k].Where != null)
                    full_query += l[k].Text + " " + l[k].Where;
                else
                    full_query += l[k].Text + " ";

            }
            //MessageBox.Show(k.ToString() + "|" + l.Count.ToString());
            //replace " . " by "." after concat token
            full_query = full_query.Replace(" . ", ".");
            //replace " = n ' " by "=n'" unicode character
            full_query = full_query.Replace("= n '", "=n'");
            full_query = full_query.Replace("= N '", "=N'");
            return full_query.Replace(" . ", ".");
        }
        private List<NCSQLToken> setDeep(string sql)
        {
            List<NCSQLTokenBase> lb = new List<NCSQLTokenBase>();
            List<NCSQLToken> l = new List<NCSQLToken>();
            int deep = 0;
            bool sub = false;
            //
            var po = new ParseOptions { };
            var scanner = new Scanner(po);
            scanner.SetSource(sql, 0);

            Tokens token;
            int state = 0;
            int start;
            int end;
            bool isPairMatch;
            bool isExecAutoParamHelp;

            while ((token = (Tokens)scanner.GetNext(ref state, out start, out end, out isPairMatch, out isExecAutoParamHelp)) != Tokens.EOF)
            {
                string str = sql.Substring(start, end - start + 1);
                //this.listBox1.Items.Add(token + ": " + str);
                //
                NCSQLTokenBase t = new NCSQLTokenBase();
                t.Text = str;
                t.Type = token.ToString();
                lb.Add(t);
            }
            //
            for (int i = 0; i < lb.Count; i++)
            {
                NCSQLToken t = new NCSQLToken();
                t.Text = lb[i].Text;
                t.Type = lb[i].Type;
                //40 = ( character
                if (lb[i].Type == "40" && lb[i].Text == "(" && lb[i + 1].Type.ToUpper() == "TOKEN_SELECT")
                {
                    deep += 1;
                    sub = true;
                }
                t.Deep = deep;
                //42 is ) character
                if (lb[i].Type == "41" && lb[i].Text == ")" && sub)
                {
                    deep -= 1;
                    sub = false;
                }
                l.Add(t);
            }
            return l;
        }
        private int findWhereClauseSameDeep(List<NCSQLToken> l, int pos, int deep)
        {
            while (pos < l.Count && deep >= l[pos].Deep)
            {
                if (l[pos].Type.ToUpper() == "TOKEN_WHERE" && l[pos].Deep == deep)
                    return pos;
                pos++;
            }
            return -1;
        }
        private string findAlias(List<NCSQLToken> l, int pos)
        {
            if (pos >= l.Count)
                return "";
            if (l[pos].Type.ToUpper() == "TOKEN_ID")// find column name after As
                return l[pos].Text;
            return "";
        }
        private int findLastElement(List<NCSQLToken> l, string table, int pos, int deep)
        {
            //pos: position of table
            //move previous
            //select * from (select * from abc) ; 
            //select * from abc,(select * from deff where 1=1 and k(select id from ddd)) as b where a1=1,abc.b1=b.b1
            if (pos == l.Count - 1)
                return pos;
            if (l[pos + 1].Text == ")" || l[pos + 1].Text == ",")
            {
                pos = pos + 1;
                //move previous
                while (pos > 0 && deep == l[pos].Deep && table != l[pos].Text && pos > 0)
                    pos -= 1;
                return pos;
            }
            else
            {
                //move next
                while (pos < l.Count && deep == l[pos].Deep)
                    pos += 1;
                return pos - 1;
                //
            }

        }
        public List<string> getFilter(IDbConnection conn, string table_name, long userid)
        {
            string sql = "select filter_sql ";
            sql += " from nc_sc_table_filter ";
            sql += " where table_name = '" + table_name + "' and _deleted = 0  and _active = 1";
            sql += "                and id in( ";
            sql += "                         select filter_id from nc_sc_table_role";
            sql += "                            where role_id in(select role_id from nc_core_user_role where user_id = " + userid + ")";
            sql += "                        union ";
            sql += "                        select filter_id from nc_sc_table_user ";
            sql += "                            where user_id =" + userid;
            sql += ") ";
            NCLogger.Debug("==>FILTER CONFIG:" + sql);
            return conn.Query<string>(sql).ToList();
        }


    }
    public class NCSQLToken
    {
        public string Type { get; set; }
        public string Text { get; set; }
        public int Deep { get; set; }
        public string Where { get; set; }

    }
    public class NCSQLTokenBase
    {
        public string Type { get; set; }
        public string Text { get; set; }

    }
}

