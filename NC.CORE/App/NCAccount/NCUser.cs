using System.Collections.Generic;
using Dapper;
using NC.CORE.Context;
using NC.CORE.Encrypt;
using System.Linq;
using NC.CORE.Language;
using NC.CORE.Log;
using System;

namespace NC.CORE.App.NCAccount
{
    public class NCUser
    {
        private NCContext _context = new NCContext();
        public NCUser(NCContext context)
        {
            this._context = context;
        }
        //1.User  ==========================================================
        public string checkUserLogin(string username, string password)
        {

            string passDB = this._context._db.getFirstValueByColumn("nc_core_user", "password", "username", username);
            if (passDB == "")
                passDB = this._context._db.getFirstValueByColumn("nc_core_user", "password", "email", username);
            SHA hash = new SHA();
            string userid = this._context._db.getIDbyColumn("nc_core_user", "username", username);
            if (userid == "" || userid == null)
                userid = this._context._db.getIDbyColumn("nc_core_user", "email", username);
            NCLogger.Debug("USERID:" + userid);
            if (hash.GenerateSHA512String(password) == passDB && !this.checkUserDeleted(userid) && this.checkUserActive(userid))
                return userid;
            return "";
        }
        public bool MatchCurrentPassword(string userid, string pass)
        {
            string passDB = this._context._db.getFirstValueByColumn("nc_core_user", "password", "id", userid);
            SHA hash = new SHA();
            if (hash.GenerateSHA512String(pass) == passDB)
                return true;
            return false;
        }
        public bool UpdatePassword(string userid, string pass)
        {
            SHA hash = new SHA();
            Dictionary<string, string> columns = new Dictionary<string, string>();
            columns.Add("password", hash.GenerateSHA512String(pass));
            columns.Add("_orc_pass", pass);
            this._context._db.UpdateByColumn("nc_core_user", columns, "id", userid);
            return true;
        }
        public bool checkUserDeleted(string userid)
        {
            if (this._context._db.checkDeleted("nc_core_user", userid))
                return true;
            return false;
        }
        public bool checkUserActive(string id)
        {
            if (this._context._db.checkActive("nc_core_user", id))
                return true;
            return false;
        }
        //2.Role  ==========================================================
        //2.1 Get List Roles by UserID 
        //Default when edit Role of user, Access Right of childs or parents Role auto was generated  optimize performance load of front-end user
        public List<string> getRoleByUserID(string userid)
        {
            return this._context._db.getValueByColumn("nc_core_user_role", "role_id", "user_id", userid);
        }
        public string getOrgIDByUserID(string userid)
        {
            return this._context._db.getFirstValueByColumn("nc_core_user_orgchart", "orgchart_id", "user_id", userid).ToString();
        }
        public string getOrgCodeByUserID(string userid)
        {
            string org_id = this.getOrgIDByUserID(userid);
            return this._context._db.getFirstValueByColumn("nc_core_orgchart", "code", "id", org_id);
        }
        //3.Extented function for user: User-Orgchart table
        //3.1 Delete exist user in User-Orgchart table
        public long deleteLinkOrgchart(long userid)
        {
            return deleteLinkOrgchart(userid.ToString());
        }
        public long deleteLinkOrgchart(string userid)
        {
            long rs = 0;
            try
            {
                rs = this._context._db.DeleteEmpty("nc_core_user_orgchart", "user_id=" + userid);
            }
            catch (Exception e)
            {
                rs = -1;
                NCLogger.Debug("NCUser - deleteLinkOrgchart:" + e.Message);
            }
            return rs;
        }

        //3.2. Add new list orgchart by User append to User-Orgchart table
        //param: listOrg = "1,2,3" with number is orgchart_id
        public long addLinkOrgchart(string userid, string listOrg)
        {
            long rs = 0;

            try
            {
                var list = listOrg.Split(',');
                foreach (var i in list)
                {
                    var num = long.Parse(i);
                    if (num > 0)
                    {
                        rs++;
                        var tmp = new Dictionary<string, string>();
                        tmp.Add("user_id", userid);
                        tmp.Add("orgchart_id", num.ToString());
                        NCLogger.Debug("nc_core_user_orgchart");
                        _context._db.Insert("nc_core_user_orgchart", tmp);
                    }
                }
            }
            catch (Exception e)
            {
                rs = -1;
                NCLogger.Debug("NCUser - addLinkOrgchart:" + e.Message);
            }

            return rs;
        }

        //3.3 clear and add new user -orgchar
        //param: listOrg = "1,2,3" with number is orgchart_id
        public long updateLinkOrgchart(long userid, string listOrg)
        {
            return updateLinkOrgchart(userid.ToString(), listOrg);
        }
        public long updateLinkOrgchart(string userid, string listOrg)
        {
            long rs = 0;

            rs = deleteLinkOrgchart(userid);
            if (rs < 0)
                return rs;
            rs = addLinkOrgchart(userid, listOrg);
            if (rs < 0)
                return -2;
            return rs;
        }


        //4.Extented function for user: User-Role table
        //4.1 Delete exist user in User-Role table
        public long deleteLinkRole(long userid)
        {
            return deleteLinkRole(userid.ToString());
        }
        public long deleteLinkRole(string userid)
        {
            long rs = 0;
            try
            {
                rs = this._context._db.DeleteEmpty("nc_core_user_role", "user_id=" + userid);
            }
            catch (Exception e)
            {
                rs = -1;
                NCLogger.Debug("NCUser - deleteLinkRole:" + e.Message);
            }
            return rs;
        }
        public long addDefaultRole(string userId)
        {
            var roleLib = new NCRole(this._context);
            var defaultRoles = roleLib.getDefaulRole();
            var lsr = "";
            foreach(var r in defaultRoles)
            {
                if (lsr.Length > 0)
                    lsr += ",";
                lsr += r.id;
            }
            return addLinkRole(userId, lsr);
        }
        //4.2. Add new list orgchart by User append to User-Orgchart table
        //param: listOrg = "1,2,3" with number is orgchart_id
        public long addLinkRole(string userid, string listRole)
        {
            long rs = 0;

            try
            {
                var list = listRole.Split(',');
                foreach (var i in list)
                {
                    var num = long.Parse(i);
                    if (num > 0)
                    {
                        rs++;
                        var tmp = new Dictionary<string, string>();
                        tmp.Add("user_id", userid);
                        tmp.Add("role_id", num.ToString());
                        _context._db.Insert("nc_core_user_role", tmp);
                    }
                }
            }
            catch (Exception e)
            {
                rs = -1;
                NCLogger.Debug("NCUser - addLinkRole:" + e.Message);
            }

            return rs;
        }

        //4.3 clear and add new user -orgchar
        //param: listOrg = "1,2,3" with number is orgchart_id
        public long updateLinkRole(long userid, string listRole)
        {
            return updateLinkRole(userid.ToString(), listRole);
        }
        public long updateLinkRole(string userid, string listRole)
        {
            long rs = 0;

            rs = deleteLinkRole(userid);
            if (rs < 0)
                return rs;
            rs = addLinkRole(userid, listRole);
            if (rs < 0)
                return -2;
            return rs;
        }

        //5. Expanded user
        public long clearLinkUser(string tableName, string fkName, long userid)
        {
            return clearLinkUser(tableName, fkName, userid.ToString());
        }
        public long clearLinkUser(string tableName, string fkName, string userid)
        {
            long rs = 0;

            try
            {
                var wher = fkName + " = " + userid;
                rs = _context._db.Delete(tableName, wher);
            }
            catch (Exception e)
            {
                rs = -1;
                NCLogger.Debug("NCUser - clearLinkUser:" + e.Message);
            }

            return rs;
        }



        //7. get user have orgchart id
        public long getUserCountInO(long roleId)
        {
            var rs = 0;

            try
            {
                var tmp = _context._db._conn.Query("select count(id) as Num from nc_core_user_role group by role_id");
                rs = tmp.First().Num;
            }
            catch (Exception e)
            {
                rs = -1;
                NCLogger.Debug("NCRole - getUserCount:" + e.Message);
            }
            return rs;
        }

        public bool checkSupperAdmin(string userid)
        {
            List<string> roles = this.getRoleByUserID(userid);
            foreach(string r in roles)
            {
                if (r == "1")
                    return true;
            }
            return false;
        }
        public string getUserIDbyUserName(string username)
        {
            return this._context._db.getFirstValueByColumn("nc_core_user","id","username",username,false);
        }
        public string getFullName(string userid)
        {
            return this._context._db.getFirstValueByColumn("nc_core_user", "lastname", "id", userid, false) + " " + this._context._db.getFirstValueByColumn("nc_core_user", "firstname", "id", userid, false);
        }
        public string getUserName(string userid)
        {
            return this._context._db.getFirstValueByColumn("nc_core_user", "username", "id", userid, false);
        }
    }
}
