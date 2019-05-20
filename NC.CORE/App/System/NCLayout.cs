using System.Collections.Generic;
using Dapper;
using NC.CORE.Context;
namespace NC.CORE.App.System
{
    public class NCLayout
    {
        private NCContext _context = new NCContext();
        public NCLayout(NCContext context)
        {
            this._context = context;
        }
        public List<string> getPostionInLayout(string page_id)
        {
            var layout_id = this._context._db.getFirstValueByColumn("nc_sc_page", "layout_id", "page_id", page_id);
            List<string> postions = this._context._db.getValueByColumn("nc_sc_layout_postion", "postion", "id", layout_id.ToString());
            return postions;
        }
    }
}
