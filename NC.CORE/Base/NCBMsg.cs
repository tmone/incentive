using System;
using System.Collections.Generic;
using System.Text;
namespace NC.CORE.Base
{
   public class NCBMsg
    {

        protected List<NCDTOMsg> _msg=new List<NCDTOMsg>();
        /*
        1. type:
            : 0 error;
            : 1 waring
            : 2 success
        2. level: 
            : 0 DB : Debug mode
            : 1 Bussiness : Product mode
            : 2 View: product mode
        */
        //1. set error advance
        public void setMsg(string msg,byte type=0,byte level=0)
        {
            NCDTOMsg e=new NCDTOMsg();
            e.setMsg(msg);
            e.setType(type);
            e.setLevel(level);
            this._msg.Add(e);
        }
        //2. set Danger, default level=1 for bussiness error in Controller
        public void setDanger(string msg, byte level = 1)
        {
            NCDTOMsg e = new NCDTOMsg();
            e.setMsg(msg);
            e.setType(0);
            e.setLevel(level);
            this._msg.Add(e);
        }
        //2. set warning, default level=1 for bussiness error in Controller
        public void setWarning(string msg, byte level = 1)
        {
            NCDTOMsg e = new NCDTOMsg();
            e.setMsg(msg);
            e.setType(1);
            e.setLevel(level);
            this._msg.Add(e);
        }
        //3. set Success alert, default level=1 for bussiness alert in Controller
        public void setSuccess(string msg,byte level=1)
        {
            NCDTOMsg e = new NCDTOMsg();
            e.setMsg(msg);
            e.setType(2);
            e.setLevel(level);
            this._msg.Add(e);
        }
        //4. get all errors
        public List<NCDTOMsg> getMsg()
        {
            return this._msg;
        }
        //5. get all Success
        public List<NCDTOMsg> getSuccess()
        {
            List<NCDTOMsg> l = new List<NCDTOMsg>();
            foreach (NCDTOMsg e in this._msg)
            { 
                if(e.getType()==2)
                   l.Add(e);
            }
            return l;
        }
        //6. get all Warning
        public List<NCDTOMsg> getWarning()
        {
            List<NCDTOMsg> l = new List<NCDTOMsg>();
            foreach (NCDTOMsg e in this._msg)
            {
                if (e.getType() == 1)
                    l.Add(e);
            }
            return l;
        }
        //7. get all Warning
        public List<NCDTOMsg> getDanger()
        {
            List<NCDTOMsg> l = new List<NCDTOMsg>();
            foreach (NCDTOMsg e in this._msg)
            {
                if (e.getType() == 0)
                    l.Add(e);
            }
            return l;
        }
        public List<NCDTOMsg> addMsg(List<NCDTOMsg> l)
        {
            foreach (NCDTOMsg e in l)
            {
                this._msg.Add(e);
            }
            return this._msg;
        }
        //8. 
    }
}
